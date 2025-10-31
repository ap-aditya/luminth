import os
import dropbox
import datetime
import logging

APP_KEY = os.environ.get("DROPBOX_APP_KEY")
APP_SECRET = os.environ.get("DROPBOX_APP_SECRET")
REFRESH_TOKEN = os.environ.get("DROPBOX_REFRESH_TOKEN")
DAYS_TO_KEEP = 4
DROPBOX_FOLDER_PATH = ""
BATCH_DELETE_SIZE = 1000 

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_old_files(dbx):
    logging.info(f"Checking for files older than {DAYS_TO_KEEP} days in app folder...")
    threshold_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=DAYS_TO_KEEP)
    old_files = []
    
    try:
        result = dbx.files_list_folder(DROPBOX_FOLDER_PATH, recursive=True)

        while True:
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FileMetadata):
                    client_modified_aware = entry.client_modified.replace(tzinfo=datetime.timezone.utc)

                    if client_modified_aware < threshold_date:
                        logging.info(f"Found old file: {entry.path_display} (Modified: {entry.client_modified})")
                        old_files.append(entry.path_display)
            
            if not result.has_more:
                break
            
            logging.info("Fetching next page of files...")
            result = dbx.files_list_folder_continue(result.cursor)
            
    except dropbox.exceptions.ApiError as e:
        logging.error(f"Dropbox API error when listing files: {e}")
        return []
        
    return old_files

def delete_files_batch(dbx, file_paths):
    if not file_paths:
        logging.info("No old files to delete.")
        return

    logging.info(f"Preparing to batch-delete {len(file_paths)} files...")
    for i in range(0, len(file_paths), BATCH_DELETE_SIZE):
        batch_paths = file_paths[i:i + BATCH_DELETE_SIZE]
        batch_num = (i // BATCH_DELETE_SIZE) + 1
        logging.info(f"Processing batch {batch_num} ({len(batch_paths)} files)...")
        entries = [dropbox.files.DeleteArg(path) for path in batch_paths]
        
        try:
            dbx.files_delete_batch(entries)
            logging.info(f"Successfully deleted batch {batch_num}.")
            
        except dropbox.exceptions.ApiError as e:
            logging.error(f"Failed to delete batch {batch_num}: {e}")

def main():
    if not all([APP_KEY, APP_SECRET, REFRESH_TOKEN]):
        logging.error("Missing Dropbox credentials. Ensure environment variables are set.")
        return

    try:
        dbx = dropbox.Dropbox(
            app_key=APP_KEY,
            app_secret=APP_SECRET,
            oauth2_refresh_token=REFRESH_TOKEN,
        )
        dbx.users_get_current_account() 
        logging.info("Successfully connected to Dropbox.")
    except Exception as e:
        logging.error(f"Failed to connect to Dropbox: {e}")
        return
        
    files_to_delete = get_old_files(dbx)
    delete_files_batch(dbx, files_to_delete)
    logging.info("Dropbox cleanup complete.")

if __name__ == "__main__":
    main()