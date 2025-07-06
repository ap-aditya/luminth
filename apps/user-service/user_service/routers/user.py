import datetime
import logging
from typing import Annotated

import firebase_admin
from db_core.crud import user_crud
from db_core.database import get_session
from db_core.models import User
from db_core.schemas import UserUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.security import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/me", response_model=User, summary="Get Current User's Profile")
async def get_current_user_profile(
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = user.get("uid")
    logging.info(f"Fetching profile for user UID: {uid}")

    db_user = await user_crud.get_user(session, uid)

    if not db_user:
        logging.warning(f"User profile for UID {uid} not found in local DB.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in the database.",
        )
    return db_user


@router.put("/me", response_model=User, summary="Update Current User's Profile")
async def update_current_user_profile(
    user_update: UserUpdate,
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = user.get("uid")
    logging.info(f"Attempting to update profile for user UID: {uid}")

    db_user = await user_crud.get_user(session, uid)
    if not db_user:
        logging.warning(f"User UID {uid} not found in DB for update.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found to update."
        )

    if "dob" in user_update and user_update.dob is not None:
        try:
            if isinstance(user_update.dob, str):
                parsed_date = datetime.date.fromisoformat(user_update.dob)
            else:
                parsed_date = user_update.dob

            today_utc = datetime.datetime.now(datetime.UTC).date()
            if parsed_date > today_utc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Date of birth cannot be in the future.",
                )

            min_age = 13
            age = (
                today_utc.year
                - parsed_date.year
                - (
                    (today_utc.month, today_utc.day)
                    < (parsed_date.month, parsed_date.day)
                )
            )
            if age < min_age:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        f"You must be at least {min_age} "
                        "years old to use this service."
                    ),
                )

            user_update["dob"] = parsed_date
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid date format for 'dob'. Please use YYYY-MM-DD.",
            ) from None

    updated_user = await user_crud.update_user(
        session=session, user=db_user, user_update=user_update
    )

    await session.commit()
    await session.refresh(updated_user)

    logging.info(f"Successfully updated profile for user UID: {uid}")
    return updated_user


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Current User's Account",
)
async def delete_current_user_account(
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = user.get("uid")
    logging.info(f"Initiating account deletion for user UID: {uid}")
    try:
        firebase_admin.auth.delete_user(uid)
        logging.info(f"User {uid} successfully deleted from Firebase Auth.")
    except firebase_admin.auth.UserNotFoundError:
        logging.warning(
            f"User {uid} not found in Firebase Auth, but delete request was made."
            "Proceeding with local DB deletion."
        )
    except Exception as e:
        logging.error(f"Firebase error deleting user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Failed to delete user from authentication service." "Please try again."
            ),
        ) from e

    try:
        await user_crud.delete_user(session, user_id=uid)
        await session.commit()
        logging.info(
            f"User {uid} and their data successfully deleted from the local database."
        )
    except Exception as e:
        await session.rollback()
        logging.critical(
            f"CRITICAL: User {uid} was deleted from Firebase Auth"
            " but FAILED to be deleted from local DB: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to delete user data after authentication record was removed. "
                "Please contact support."
            ),
        ) from e

    return None
