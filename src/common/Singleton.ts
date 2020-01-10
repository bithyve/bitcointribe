export default class Singleton {
    static myInstance = null;
    public selectedPdfDetails: any;
    /**
     * @returns {Singleton}
     */
    static getInstance() {
        if ( Singleton.myInstance == null ) {
            Singleton.myInstance = new Singleton();
        }
        return this.myInstance;
    }
    // TODO: pdfdetails
    getSeletedPdfDetails() {
        return this.selectedPdfDetails;
    }
    setSelectedPdfDetails( item: any ) {
        this.selectedPdfDetails = item;
    }
}
