// Group flat sales array into bills by billId
export function groupByBill(sales) {
    const billMap = {};
    (sales || []).forEach(s => {
        const key = s.billId || s._id;
        if (!billMap[key]) {
            billMap[key] = {
                billId: key,
                billNumber: s.billNumber || null,
                date: s.date,
                note: s.note,
                items: [],
                totalAmount: 0,
                totalUnits: 0,
            };
        }
        billMap[key].items.push(s);
        billMap[key].totalAmount += s.totalAmount || 0;
        billMap[key].totalUnits += s.quantitySold || 0;
    });
    return Object.values(billMap).sort((a, b) => {
        if (a.billNumber && b.billNumber) {
            return b.billNumber.localeCompare(a.billNumber);
        }
        return new Date(b.date) - new Date(a.date);
    });
}
