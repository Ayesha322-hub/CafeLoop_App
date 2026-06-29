import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JazzCashPaymentDto } from '../dtos/jazzcash-payment.dto';

@Injectable()
export class JazzCashService {
  async initiatePayment(dto: JazzCashPaymentDto) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');

    const txnDateTime =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const expiry = new Date(now.getTime() + 3600 * 1000);
    const txnExpiryDateTime =
      `${expiry.getFullYear()}${pad(expiry.getMonth() + 1)}${pad(expiry.getDate())}` +
      `${pad(expiry.getHours())}${pad(expiry.getMinutes())}${pad(expiry.getSeconds())}`;

    const txnRefNo = `T${txnDateTime}`;
    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? '';

    const params: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID ?? '',
      pp_SubMerchantID: '',
      pp_Password: process.env.JAZZCASH_PASSWORD ?? '',
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(Math.round(dto.amount * 100)), // paisas
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: dto.orderId,
      pp_Description: `CafeLoop Order ${dto.orderId.slice(-6).toUpperCase()}`,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: `${process.env.APP_URL}/api/v1/payments/jazzcash/callback`,
      pp_MobileNumber: dto.mobileNumber,
      ppmpf_1: dto.userId,
    };

    // Build HMAC-SHA256 secure hash
    const sortedValues = Object.keys(params)
      .sort()
      .map((k) => params[k])
      .filter(Boolean)
      .join('&');

    const hashString = `${salt}&${sortedValues}`;
    const secureHash = crypto
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex');

    const payload = { ...params, pp_SecureHash: secureHash };

    const response = await fetch(process.env.JAZZCASH_API_URL ?? '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as Record<string, string>;

    if (result.pp_ResponseCode !== '000') {
      throw new BadRequestException(result.pp_ResponseMessage ?? 'JazzCash payment failed');
    }

    return {
      success: true,
      txnRefNo,
      responseCode: result.pp_ResponseCode,
      responseMessage: result.pp_ResponseMessage,
    };
  }
}
