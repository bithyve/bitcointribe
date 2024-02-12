export const  transformData=(feeData)=>{
    // Assuming feeData is an array of objects sorted by timestamp in ascending order
    if (!feeData || feeData.length < 2) {
        return "Insufficient data to calculate fee changes.";
    }

    // Get the latest (current), yesterday's, and last week's fee data
    const latestFee = feeData[feeData.length - 1].avgFee_50;
    const yesterdayFee = feeData[feeData.length - 2].avgFee_50;
    const lastWeekFee = feeData[0].avgFee_50; // Assuming the first element is from one week ago

    // Calculate the percentage change
    const changeFromYesterday = ((latestFee - yesterdayFee) / yesterdayFee) * 100;
    const changeFromLastWeek = ((latestFee - lastWeekFee) / lastWeekFee) * 100;

    // Create the statement
    return `Bitcoin average transaction fees are currently at ${latestFee} sats/vB, ` +
           `down from ${yesterdayFee} sats/vB yesterday and up from ${lastWeekFee} sats/vB one week ago. ` +
           `This is a change of ${changeFromYesterday.toFixed(2)}% from yesterday and ` +
           `${changeFromLastWeek.toFixed(2)}% from a week ago.`;
}

