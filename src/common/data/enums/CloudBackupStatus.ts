enum CloudBackupStatus {

    /**
     * Cloud backup has not started yet
     */
    PENDING = 'PENDING',

    /**
     * Cloud backup has started and is still in progress and not completed yet
     */
    IN_PROGRESS = 'IN_PROGRESS',

    /**
     * Cloud backup has completed successfully and there was no error or issue in completing the cloud backup
     */
    COMPLETED = 'COMPLETED',
    /**
     * Cloud backup was started but did not complete and there was an error in completing cloud backup
     */
     FAILED = 'FAILED',
  }

export default CloudBackupStatus

