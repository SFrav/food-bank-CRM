export const ViolationMessages = (error: Error | any, genericMessage: string): never => {
  const msg = error?.message || '';

  if (error?.code === '23505') {
    if (msg.includes('uq_contacts_email') || msg.includes('contacts_email_key')) throw new Error('A contact with this email address already exists');
    if (msg.includes('uq_contacts_phone') || msg.includes('contacts_phone_key')) throw new Error('A contact with this phone number already exists');
    if (msg.includes('uq_contacts_name_address_postcode')) throw new Error('A contact with this name, address, and postcode combination already exists');
    if (msg.includes('uq_contacts_allotment')) throw new Error('An allotment for this beneficiary on this date already exists');
    if (msg.includes('uq_entity_setting') || msg.includes('uq_division_setting') || msg.includes('uq_user_setting')) throw new Error('This setting already exists for the selected entity/division/user');
    if (msg.includes('uq_division_open') || msg.includes('uq_division_closed')) throw new Error('Schedule conflict: this division is already open/closed for the specified day/date');
    if (msg.includes('uq_contacts_days')) throw new Error('Availability day already set for this contact');
    if (msg.includes('uq_referrer_rating')) throw new Error('Rating for this referrer and contact already exists');
    if (msg.includes('system_settings_setting_pkey')) throw new Error('System setting key already exists');
    if (msg.includes('user_profiles_user_id_key') || msg.includes('user_profiles_email_key')) throw new Error('User profile or email already registered');
    throw new Error('Duplicate data detected. Please verify your input');
  }

  if (error?.code === '23514') {
    if (msg.includes('contacts_days_day_of_week_check')) throw new Error('Day of week value is not within the expected range. Contact your administrator');
    throw new Error('Input data violates a database rule. Please check your entries.');
  }

  if (error?.code === '23503') {
    if (msg.includes('referrer_user_id_fkey')) {
      throw new Error('Contact your administrator. A referred beneficiary needs to be linked to an active referrer to complete this action');
    }
    if (msg.includes('allotment_contact_id_fkey') || msg.includes('referrer_contact_id_fkey')) {
      throw new Error('The selected contact does not exist or has been deleted');
    }
    if (msg.includes('division_divisions_id_fkey') || msg.includes('open_divisions_id_fkey') || msg.includes('closed_divisions_id_fkey')) {
      throw new Error('The selected division does not exist or has been deleted');
    }
    if (msg.includes('contacts_owner_id_fkey') || msg.includes('contacts_user_id_fkey')) {
      throw new Error('The owner or updater user profile does not exist');
    }
    throw new Error('Contact your administrator. A related table lacks information for you to complete this action');
  }

  // Permission Violations (42501)
  if (error?.code === '42501') {
    if (msg.includes('contacts_select')) {
      throw new Error('You do not have the required permissions to perform this action');
    }
    throw new Error('You do not have the required permissions to perform this action');
  }

  throw new Error(genericMessage);
};