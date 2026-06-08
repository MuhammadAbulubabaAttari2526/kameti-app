// ═══════════════════════════════════════════════════════
// KametiApp — Language System
// Roman Urdu ↔ English
// ═══════════════════════════════════════════════════════

const TRANSLATIONS = {
  ur: {
    // ── Brand ──
    brand_name: 'KametiApp',
    brand_tagline: 'Digital Committee System',

    // ── Auth Page ──
    login_tab: 'Login',
    signup_tab: 'Sign Up',
    login_welcome: 'Khush Aamdeed! 👋',
    login_sub: 'Apne account mein login karein',
    signup_welcome: 'Account Banayein ✨',
    signup_sub: 'Bilkul muft — abhi shuru karein',
    label_email: 'Email Address',
    label_password: 'Password',
    label_fullname: 'Full Name',
    label_confirm_pass: 'Confirm Password',
    placeholder_email: 'aapka@email.com',
    placeholder_name: 'Aapka poora naam',
    remember_me: 'Mujhe yaad rakho',
    forgot_pass: 'Password bhool gaye?',
    btn_login: 'Login Karein',
    btn_signup: 'Account Banayein',
    btn_google: 'Google',
    btn_phone: 'Phone',
    divider_or: 'ya phir',
    active_account: 'Active Account',
    account_type: 'Account Type',
    free_plan: 'Free Plan',
    login_time: 'Login Time',
    status: 'Status',
    verified: 'Verified',
    btn_go_app: 'KametiApp Mein Jao',
    btn_logout: 'Logout Karein',
    forgot_title: 'Password Reset Karein',
    forgot_sub: 'Apni email daakhil karein — hum reset link bhejenge',
    btn_send_link: 'Reset Link Bhejo',
    back_to_login: 'Wapas Login Par',
    footer_text: 'Secure · Private · Free',

    // ── Index / Dashboard ──
    nav_dashboard: 'Dashboard',
    nav_members: 'Members',
    nav_payments: 'Payments',
    nav_create: 'Create',
    section_members: 'Members',
    section_payments: 'Payments',
    section_create: 'Create New',
    search_member: 'Member ka naam dhundein...',
    chip_all: 'All',
    chip_paid: 'Paid',
    chip_pending: 'Pending',
    chip_late: 'Late',
    add: 'Add',
    record: 'Record',

    // ── Topbar Dropdown ──
    dd_new_kameti: 'Nayi Kameti',
    dd_create_menu: 'Create Menu',
    dd_logout: 'Logout Karein',

    // ── Create Page Options ──
    create_kameti_title: 'Nayi Kameti Banayein',
    create_kameti_sub: 'Naya committee group setup karein',
    create_member_title: 'Member Add Karein',
    create_member_sub: 'Existing committee mein naya member add karein',
    create_payment_title: 'Payment Record Karein',
    create_payment_sub: 'Member ka payment manually record karein',
    create_fine_title: 'Fine Lagayein',
    create_fine_sub: 'Late payment par member ko fine apply karein',
    create_qa_title: 'Quran Andazi',
    create_qa_sub: 'Random draw se is maah ka winner nikaalo',

    // ── Modals ──
    modal_new_kameti: 'Nayi Kameti Banayein',
    label_comm_name: 'Committee Name',
    label_total_members: 'Total Members',
    label_monthly_amt: 'Monthly Amount (Rs)',
    label_start_date: 'Start Date',
    btn_create_kameti: 'Kameti Banao',

    modal_add_member: 'Member Add Karein',
    label_phone: 'Phone Number',
    label_committee: 'Committee',
    btn_add_member: 'Member Add Karein',

    modal_record_pay: 'Payment Record Karein',
    label_member: 'Member',
    label_amount: 'Amount (Rs)',
    label_pay_date: 'Payment Date',
    label_notes: 'Notes (Optional)',
    btn_record_pay: 'Payment Record Karein',

    modal_fine: 'Fine Lagayein',
    label_fine_amt: 'Fine Amount (Rs)',
    label_reason: 'Reason',
    btn_apply_fine: 'Fine Apply Karein',

    modal_qa: '🎴 Quran Andazi',
    label_select_comm: 'Committee Select Karein',
    label_eligible: 'Draw Mein Shamil Members',
    btn_draw: 'Draw Karein',
    qa_footer: 'Sirf eligible members (jo pehle winner nahi ban chuke) draw mein shamil honge',
    qa_winner_label: 'Is Maah Ka Winner',
    qa_prev_winners: 'Pichle Winners',
    btn_redraw: 'Dubara Draw Karein',
    btn_drawing: 'Draw ho raha hai...',
    qa_all_done: 'Tamam members draw ho chuke hain.',
    qa_none_eligible: 'Koi eligible member nahi',

    modal_logout: 'Logout Karein? 👋',
    logout_sub: 'Aap apne account se logout ho jayenge',
    btn_go_back: 'Wapas Jao',
    btn_confirm_logout: 'Logout',

    // ── Dashboard Strings ──
    active_committees: 'Active Committees',
    total_members_lbl: 'Total Members',
    collected_lbl: 'Collected',
    pending_lbl: 'Pending',
    payments_lbl: 'Payments',
    no_committee: 'Koi committee nahi. Nayi kameti banayein!',
    dropdown_no_committee: 'Pehle committee banayein',
    collected_suffix: 'collected',
    paid_suffix: '% paid',
    payment_log: 'Payment Log',
    details: 'Details',
    monthly: 'Monthly',
    member_hash: 'Member #',
    paid_status: 'Paid',
    late_status: 'Late — Fine Applied',
    pending_status: 'Pending',
    month_prefix: 'Month',

    // ── Member Detail ──
    member_detail: 'Member Detail',
    phone_lbl: 'Phone',
    committee_lbl: 'Committee',
    status_lbl: 'Status',
    turn_lbl: 'Turn',
    payments_history: 'Payments History',
    btn_mark_paid: 'Mark Paid',
    btn_apply_fine: 'Fine Lagao',
    btn_delete: 'Delete',
    no_payments: 'Koi payment record nahi',

    // ── Kameti Detail ──
    total_members_d: 'Total Members',
    monthly_amount_d: 'Monthly Amount',
    start_date_d: 'Start Date',
    current_month_d: 'Current Month',
    paid_this_month_d: 'Paid This Month',
    total_collected_d: 'Total Collected',
    btn_add_member_d: 'Add Member',

    // ── Toast / misc ──
    dark_mode: 'Dark mode on 🌙',
    light_mode: 'Light mode on ☀️',
    no_member_found: 'Koi member nahi mila',
    lang_switched: 'Zuban tabdeel ho gayi ✅',

    // ── Dynamic toasts ──
    toast_committee_created: 'successfully create ho gayi! ✅',
    toast_committee_full: 'bhar chuki hai!',
    toast_member_added: 'mein add kar diya! ✅',
    toast_payment_recorded: 'ka payment record ho gaya! 💰',
    toast_month_complete: 'complete! Naya maah shuru ho gaya.',
    toast_fine_applied: 'par fine apply ho gaya! ⚠️',
    toast_member_deleted: 'delete ho gaye',
    toast_committee_deleted: 'delete ho gayi',
    toast_logout_error: 'Logout mein masla aaya',
    toast_save_error: 'Data save mein masla aaya ⚠️',
    toast_load_error: 'Data load mein masla aaya ⚠️',
    toast_wa_sent: 'ko WhatsApp reminder bheja! 📲',
    toast_wa_bulk_sending: 'members ko WhatsApp reminders bheje ja rahe hain 📲',
    toast_wa_no_phone: 'ka phone number save nahi hai! ⚠️',
    toast_wa_none_pending: 'Koi pending/late member nahi hai ✅',
    toast_wa_no_phones_any: 'Kisi bhi member ka phone number save nahi hai ⚠️',
    toast_winner: 'is maah ka winner! Mubarak!',

    // ── Confirm dialogs ──
    confirm_delete_member: 'delete karna chahte hain?',
    confirm_delete_committee: 'delete karna chahte hain? Sab members aur payments bhi hata diye jayenge.',

    // ── Inline UI strings ──
    phone_not_saved: 'Phone nahi',
    wa_reminder_btn: 'WhatsApp Reminder Bhejo',
    wa_save_phone_hint: 'Phone number save karein taake WhatsApp reminder bhej sakein',
    late_payment_banner: 'Late Payment — Fine Applicable',
    late_payment_sub: 'ka payment late hai.',
    pending_payment_banner: 'Pending Payments',
    pending_payment_sub: 'ka payment abhi pending hai.',
    remind_all_btn: 'Sab ko Remind Karein',
    unknown_committee: 'Unknown Committee',
    entries_lbl: 'entries',
    paid_lbl: 'paid',
    late_lbl: 'late',
    more_lbl: 'aur',
    unknown_member: 'Unknown',
  },

  en: {
    // ── Brand ──
    brand_name: 'KametiApp',
    brand_tagline: 'Digital Committee System',

    // ── Auth Page ──
    login_tab: 'Login',
    signup_tab: 'Sign Up',
    login_welcome: 'Welcome Back! 👋',
    login_sub: 'Sign in to your account',
    signup_welcome: 'Create Account ✨',
    signup_sub: 'Completely free — start now',
    label_email: 'Email Address',
    label_password: 'Password',
    label_fullname: 'Full Name',
    label_confirm_pass: 'Confirm Password',
    placeholder_email: 'your@email.com',
    placeholder_name: 'Your full name',
    remember_me: 'Remember me',
    forgot_pass: 'Forgot password?',
    btn_login: 'Login',
    btn_signup: 'Create Account',
    btn_google: 'Google',
    btn_phone: 'Phone',
    divider_or: 'or',
    active_account: 'Active Account',
    account_type: 'Account Type',
    free_plan: 'Free Plan',
    login_time: 'Login Time',
    status: 'Status',
    verified: 'Verified',
    btn_go_app: 'Go to KametiApp',
    btn_logout: 'Logout',
    forgot_title: 'Reset Password',
    forgot_sub: 'Enter your email — we\'ll send a reset link',
    btn_send_link: 'Send Reset Link',
    back_to_login: 'Back to Login',
    footer_text: 'Secure · Private · Free',

    // ── Index / Dashboard ──
    nav_dashboard: 'Dashboard',
    nav_members: 'Members',
    nav_payments: 'Payments',
    nav_create: 'Create',
    section_members: 'Members',
    section_payments: 'Payments',
    section_create: 'Create New',
    search_member: 'Search member name...',
    chip_all: 'All',
    chip_paid: 'Paid',
    chip_pending: 'Pending',
    chip_late: 'Late',
    add: 'Add',
    record: 'Record',

    // ── Topbar Dropdown ──
    dd_new_kameti: 'New Committee',
    dd_create_menu: 'Create Menu',
    dd_logout: 'Logout',

    // ── Create Page Options ──
    create_kameti_title: 'Create New Committee',
    create_kameti_sub: 'Set up a new committee group',
    create_member_title: 'Add Member',
    create_member_sub: 'Add a new member to existing committee',
    create_payment_title: 'Record Payment',
    create_payment_sub: 'Manually record a member\'s payment',
    create_fine_title: 'Apply Fine',
    create_fine_sub: 'Apply a fine for late payment',
    create_qa_title: 'Lucky Draw',
    create_qa_sub: 'Pick this month\'s winner by random draw',

    // ── Modals ──
    modal_new_kameti: 'Create New Committee',
    label_comm_name: 'Committee Name',
    label_total_members: 'Total Members',
    label_monthly_amt: 'Monthly Amount (Rs)',
    label_start_date: 'Start Date',
    btn_create_kameti: 'Create Committee',

    modal_add_member: 'Add Member',
    label_phone: 'Phone Number',
    label_committee: 'Committee',
    btn_add_member: 'Add Member',

    modal_record_pay: 'Record Payment',
    label_member: 'Member',
    label_amount: 'Amount (Rs)',
    label_pay_date: 'Payment Date',
    label_notes: 'Notes (Optional)',
    btn_record_pay: 'Record Payment',

    modal_fine: 'Apply Fine',
    label_fine_amt: 'Fine Amount (Rs)',
    label_reason: 'Reason',
    btn_apply_fine: 'Apply Fine',

    modal_qa: '🎴 Lucky Draw',
    label_select_comm: 'Select Committee',
    label_eligible: 'Members in Draw',
    btn_draw: 'Draw Now',
    qa_footer: 'Only eligible members (who haven\'t won before) will be included',
    qa_winner_label: 'This Month\'s Winner',
    qa_prev_winners: 'Previous Winners',
    btn_redraw: 'Draw Again',
    btn_drawing: 'Drawing...',
    qa_all_done: 'All members have already won.',
    qa_none_eligible: 'No eligible members',

    modal_logout: 'Logout? 👋',
    logout_sub: 'You will be logged out of your account',
    btn_go_back: 'Go Back',
    btn_confirm_logout: 'Logout',

    // ── Dashboard Strings ──
    active_committees: 'Active Committees',
    total_members_lbl: 'Total Members',
    collected_lbl: 'Collected',
    pending_lbl: 'Pending',
    payments_lbl: 'Payments',
    no_committee: 'No committees yet. Create a new one!',
    dropdown_no_committee: 'Create a committee first',
    collected_suffix: 'collected',
    paid_suffix: '% paid',
    payment_log: 'Payment Log',
    details: 'Details',
    monthly: 'Monthly',
    member_hash: 'Member #',
    paid_status: 'Paid',
    late_status: 'Late — Fine Applied',
    pending_status: 'Pending',
    month_prefix: 'Month',

    // ── Member Detail ──
    member_detail: 'Member Detail',
    phone_lbl: 'Phone',
    committee_lbl: 'Committee',
    status_lbl: 'Status',
    turn_lbl: 'Turn',
    payments_history: 'Payment History',
    btn_mark_paid: 'Mark Paid',
    btn_apply_fine: 'Apply Fine',
    btn_delete: 'Delete',
    no_payments: 'No payment records',

    // ── Kameti Detail ──
    total_members_d: 'Total Members',
    monthly_amount_d: 'Monthly Amount',
    start_date_d: 'Start Date',
    current_month_d: 'Current Month',
    paid_this_month_d: 'Paid This Month',
    total_collected_d: 'Total Collected',
    btn_add_member_d: 'Add Member',

    // ── Toast / misc ──
    dark_mode: 'Dark mode on 🌙',
    light_mode: 'Light mode on ☀️',
    no_member_found: 'No members found',
    lang_switched: 'Language changed ✅',

    // ── Dynamic toasts ──
    toast_committee_created: 'created successfully! ✅',
    toast_committee_full: 'is full!',
    toast_member_added: 'added to',
    toast_payment_recorded: 'payment recorded! 💰',
    toast_month_complete: 'complete! New month started.',
    toast_fine_applied: 'fine applied! ⚠️',
    toast_member_deleted: 'deleted',
    toast_committee_deleted: 'deleted',
    toast_logout_error: 'Logout failed',
    toast_save_error: 'Error saving data ⚠️',
    toast_load_error: 'Error loading data ⚠️',
    toast_wa_sent: 'WhatsApp reminder sent! 📲',
    toast_wa_bulk_sending: 'members sending WhatsApp reminders 📲',
    toast_wa_no_phone: 'has no phone number saved! ⚠️',
    toast_wa_none_pending: 'No pending/late members ✅',
    toast_wa_no_phones_any: 'No member has a phone number saved ⚠️',
    toast_winner: 'is this month\'s winner! Congratulations!',

    // ── Confirm dialogs ──
    confirm_delete_member: 'Are you sure you want to delete',
    confirm_delete_committee: 'Delete this committee? All members and payments will also be removed.',

    // ── Inline UI strings ──
    phone_not_saved: 'No phone',
    wa_reminder_btn: 'Send WhatsApp Reminder',
    wa_save_phone_hint: 'Save phone number to send WhatsApp reminders',
    late_payment_banner: 'Late Payment — Fine Applicable',
    late_payment_sub: 'payment is late.',
    pending_payment_banner: 'Pending Payments',
    pending_payment_sub: 'payment is pending.',
    remind_all_btn: 'Remind All',
    unknown_committee: 'Unknown Committee',
    entries_lbl: 'entries',
    paid_lbl: 'paid',
    late_lbl: 'late',
    more_lbl: 'more',
    unknown_member: 'Unknown',
  }
};

// Current language — read from localStorage or default to Urdu
let currentLang = localStorage.getItem('kametiLang') || 'ur';

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('kametiLang', lang);
  applyLang();
}

function toggleLang() {
  setLang(currentLang === 'ur' ? 'en' : 'ur');
}

// Apply translations to all [data-i18n] elements
function applyLang() {
  // Update button labels
  const btnUR = document.getElementById('langBtnUR');
  const btnEN = document.getElementById('langBtnEN');
  if (btnUR) btnUR.classList.toggle('lang-active', currentLang === 'ur');
  if (btnEN) btnEN.classList.toggle('lang-active', currentLang === 'en');

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.placeholder = val;
    } else {
      el.textContent = val;
    }
  });

  // Update placeholders with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });

  // Re-render app pages — app.js ES module se functions window par set hote hain
  // Retry logic: module load hone mein waqt lagta hai
  _triggerAppRender();
}

function _triggerAppRender() {
  if (typeof window.renderDashboard === 'function') {
    window.renderDashboard();
    window.renderMembers();
    window.renderPayments();
  }
  // Agar ab tak available nahi — 300ms baad dobara try karo (module load pending)
  else {
    setTimeout(() => {
      if (typeof window.renderDashboard === 'function') {
        window.renderDashboard();
        window.renderMembers();
        window.renderPayments();
      }
    }, 300);
  }
}

// Expose globally
window.t          = t;
window.setLang    = setLang;
window.toggleLang = toggleLang;
window.applyLang  = applyLang;
window.currentLang = () => currentLang;

// Auto-apply on DOM ready
document.addEventListener('DOMContentLoaded', () => applyLang());