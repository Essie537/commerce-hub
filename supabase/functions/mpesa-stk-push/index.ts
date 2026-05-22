import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, phone, amount } = await req.json()

    // 1. Setup Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. M-Pesa Credentials (should be set in Supabase Secrets)
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const shortCode = Deno.env.get('MPESA_SHORTCODE') // Till or Paybill
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`

    if (!consumerKey || !consumerSecret) {
      throw new Error("M-Pesa credentials not configured in Edge Function secrets")
    }

    // 3. Get Access Token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    })
    const { access_token } = await tokenRes.json()

    // 4. Generate Password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortCode}${passkey}${timestamp}`)

    // 5. Initiate STK Push
    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query", { // Use /processrequest for live
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline
        Amount: amount,
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: `Order ${order_id.slice(0, 8)}`,
        TransactionDesc: "Payment for Commerce Hub"
      })
    })

    const stkData = await stkRes.json()

    // 6. Log transaction in DB
    await supabaseClient.from('mpesa_transactions').insert({
      order_id,
      phone,
      amount,
      checkout_request_id: stkData.CheckoutRequestID,
      merchant_request_id: stkData.MerchantRequestID,
      status: 'pending'
    })

    return new Response(JSON.stringify({ ok: true, data: stkData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
