export interface TrackingParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  conversionUrl?: string;
  userIp?: string;
  userAgent?: string;
  clickCapturedAt?: Date;
}

export interface PostbackPayload {
  dealId: string;
  contactId: string;
  tenantId: string;
  eventName: 'Lead' | 'InitiateCheckout' | 'Purchase' | 'Custom';
  valueCents?: number;
  currency?: string;
  tracking: TrackingParams;
}
