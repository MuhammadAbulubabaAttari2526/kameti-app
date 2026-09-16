const translations = {
  en: {
    brandTagline: 'Digital Committee System', dashboard: 'Dashboard', members: 'Members', payments: 'Payments', create: 'Create',
    activeCommittees: 'Active Committees', totalMembers: 'Total Members', collected: 'Collected', pending: 'Pending', paymentCount: 'Payments',
    paymentLog: 'Payment Log', details: 'Details', monthly: 'Monthly', paid: 'Paid', late: 'Late', pendingStatus: 'Pending',
    noCommittee: 'No committee yet. Create a new one.', createCommittee: 'Create Committee', searchMember: 'Search member name...', add: 'Add', record: 'Record',
    noMember: 'No member found', noPayments: 'No payments recorded', createNew: 'Create New', createCommitteeSub: 'Set up a new group', addMember: 'Add Member', addMemberSub: 'Insert a member into committee',
    recordPayment: 'Record Payment', recordPaymentSub: 'Log a member payment', fine: 'Apply Fine', fineSub: 'Apply a fine for late payment', draw: 'Quran Andazi', drawSub: "Pick this month's winner by random draw",
    committeeName: 'Committee Name', totalMembersField: 'Total Members', frequency: 'Payment Frequency', monthly: 'Monthly', daily: 'Daily', amountPerCycle: 'Amount (Rs)', monthlyAmount: 'Monthly Amount (Rs)', startDate: 'Start Date', fullName: 'Full Name', phone: 'Phone Number', committee: 'Committee',
    amount: 'Amount (Rs)', paymentDate: 'Payment Date', notes: 'Notes', selectCommittee: 'Select committee', selectMember: 'Select member', close: 'Close',
    latestWinner: 'Latest winner', collectionRate: 'Collection rate', lateMembers: 'Late members', pendingTotal: 'Pending total', paymentHistory: 'Payment History', noPaymentRecords: 'No payment records',
  },
  ur: {
    brandTagline: 'Digital Committee System', dashboard: 'Dashboard', members: 'Members', payments: 'Payments', create: 'Create',
    activeCommittees: 'Active Committees', totalMembers: 'Total Members', collected: 'Wasool Shuda', pending: 'Baaki', paymentCount: 'Payments',
    paymentLog: 'Payment Log', details: 'Tafseel', monthly: 'Mahawari', paid: 'Paid', late: 'Late', pendingStatus: 'Pending',
    noCommittee: 'Abhi koi committee nahi. Nayi committee banayein.', createCommittee: 'Committee Banayein', searchMember: 'Member ka naam dhundein...', add: 'Add', record: 'Record',
    noMember: 'Koi member nahi mila', noPayments: 'Koi payment record nahi', createNew: 'Naya Create Karein', createCommitteeSub: 'Naya group setup karein', addMember: 'Member Add Karein', addMemberSub: 'Committee mein member shamil karein',
    recordPayment: 'Payment Record Karein', recordPaymentSub: 'Member ki payment save karein', fine: 'Fine Lagayein', fineSub: 'Late payment par fine lagayein', draw: 'Quran Andazi', drawSub: 'Random draw se is maah ka winner nikalein',
    committeeName: 'Committee ka Naam', totalMembersField: 'Total Members', frequency: 'Payment kitni dafa?', monthly: 'Mahawari', daily: 'Rozana', amountPerCycle: 'Raqam (Rs)', monthlyAmount: 'Mahawari Raqam (Rs)', startDate: 'Shuru ki Tareekh', fullName: 'Poora Naam', phone: 'Phone Number', committee: 'Committee',
    amount: 'Raqam (Rs)', paymentDate: 'Payment ki Tareekh', notes: 'Notes', selectCommittee: 'Committee select karein', selectMember: 'Member select karein', close: 'Band Karein',
    latestWinner: 'Aakhri winner', collectionRate: 'Collection rate', lateMembers: 'Late members', pendingTotal: 'Baaki raqam', paymentHistory: 'Payment History', noPaymentRecords: 'Koi payment record nahi',
  },
};

export const t = (language, key) => translations[language]?.[key] || translations.en[key] || key;
