// lib/nimbus-sms.ts
export async function sendOtpSms(phoneNumber: string, otp: string) {
    const userId = process.env.NIMBUS_USER_ID as string;
    const password = process.env.NIMBUS_PASSWORD as string;
    const senderId = process.env.NIMBUS_SENDER_ID as string;
    const entityId = process.env.NIMBUS_ENTITY_ID as string;
    const templateId = process.env.NIMBUS_TEMPLATE_ID as string;

  const message = `Your mobile verification OTP is ${otp} for SGS School. It is valid for 10 minutes. Do not share this OTP with anyone.\n- SARAF WORLDSPHERE AI SERVICES`;
  const encodedMessage = encodeURIComponent(message);

  const apiUrl = `http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${userId}&Password=${password}&SenderID=${senderId}&Phno=${phoneNumber}&Msg=${encodedMessage}&EntityID=${entityId}&TemplateID=${templateId}`;

  try {
    const response = await fetch(apiUrl, { method: "GET" });
    const data = await response.text();
    return { success: response.ok, data };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return { success: false, error };
  }
}