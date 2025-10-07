import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    // 2. Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, email, company, address')
      .eq('id', invoice.client_id)
      .single();

    if (clientError) {
      // Not a fatal error, we can proceed without client details
      console.error('Could not fetch client details:', clientError.message);
    }

    // 3. Get user settings
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('display_name, company_name, address')
      .eq('user_id', invoice.user_id)
      .single();

    if (settingsError) {
      // Not a fatal error, proceed with defaults
      console.error('Could not fetch user settings:', settingsError.message);
    }

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info, .client-info { width: 45%; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .invoice-table th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .total-row { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>#${invoice.number}</h2>
        </div>
        
        <div class="invoice-details">
          <div class="company-info">
            <h3>From:</h3>
            <p><strong>${userSettings?.display_name || 'Your Business'}</strong></p>
            <p>${userSettings?.company_name || ''}</p>
            <p>${userSettings?.address || ''}</p>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${client?.name || 'N/A'}</strong></p>
            <p>${client?.company || ''}</p>
            <p>${client?.address || ''}</p>
            <p>${client?.email || ''}</p>
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Date Issued</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${new Date(invoice.issue_date).toLocaleDateString()}</td>
              <td>${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}</td>
              <td style="text-transform: capitalize;">${invoice.status}</td>
            </tr>
          </tbody>
        </table>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>$${Number(invoice.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td>$${Number(invoice.tax).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td><strong>$${Number(invoice.total).toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;

    // Return the HTML to be opened in a new tab
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});