export const ViolationMessages = (error: Error | any, genericMessage: string): never => {
  if (error?.code === '23503') { //&& error?.message?.includes('referrer_user_id_fkey')
    throw new Error('Contact your administrator. A related table lacks information for you to complete this action');
  }
  if (error?.code === '42501' && error?.message?.includes('contacts_select')) {
    throw new Error('You do not have the required permissions to perform this action');
  }
  throw new Error(genericMessage);
};