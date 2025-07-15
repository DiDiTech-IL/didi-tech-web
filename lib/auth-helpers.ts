// Example implementation for handling first login and sending user.activated webhook
// This should be integrated into your existing authentication system

import { sendUserActivatedWebhook } from "./webhook-utils";

export async function handleUserFirstLogin(user: {
  id: string;
  email: string;
  isFirstLogin: boolean;
  tachlesLeadId?: string;
  tachlesCustomerId?: string;
  subdomain?: string;
}) {
  if (!user.isFirstLogin) {
    return;
  }

  try {
    // Mark user as activated in your database
    // This is pseudocode - adapt to your user model
    // await updateUser(user.id, { isFirstLogin: false, activatedAt: new Date() });

    // Send user.activated webhook to Tachles if we have the required info
    if (user.tachlesLeadId && user.tachlesCustomerId && user.subdomain) {
      await sendUserActivatedWebhook(
        user.tachlesLeadId,
        user.tachlesCustomerId,
        user.subdomain
      );
    }

    console.log("User activation webhook sent for:", user.email);
  } catch (error) {
    console.error("Failed to handle user first login:", error);
  }
}

// Example usage in your login handler:
/*
export async function loginHandler(email: string, password: string) {
  // Your existing authentication logic
  const user = await authenticateUser(email, password);
  
  if (user) {
    // Handle first login
    await handleUserFirstLogin(user);
    
    return {
      success: true,
      requirePasswordChange: user.isFirstLogin,
      user: user
    };
  }
  
  return { success: false };
}
*/
