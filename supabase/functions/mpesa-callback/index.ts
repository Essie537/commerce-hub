import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

serve(async (req) => {
  try {
    const payload = await req.json()
    const { Body } = payload
    const { stkCallback } = Body

    const checkoutRequestID = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode
    const resultDesc = stkCallback.ResultDesc

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (resultCode === 0) {
      // Success
      const meta = stkCallback.CallbackMetadata.Item
      const amount = meta.find((i: any) => i.Name === 'Amount')?.Value
      const receipt = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value

      // 1. Update Transaction
      const { data: tx } = await supabaseClient
        .from('mpesa_transactions')
        .update({
          status: 'success',
          result_code: resultCode,
          result_desc: resultDesc,
          mpesa_receipt: receipt,
          raw_callback: payload
        })
        .eq('checkout_request_id', checkoutRequestID)
        .select()
        .single()

      if (tx?.order_id) {
        // 2. Update Order
        await supabaseClient
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing',
            mpesa_receipt: receipt
          })
          .eq('id', tx.order_id)
      }
    } else {
      // Failed
      await supabaseClient
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_code: resultCode,
          result_desc: resultDesc,
          raw_callback: payload
        })
        .eq('checkout_request_id', checkoutRequestID)
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
