
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model = 'qwen/qwen-2.5-7b-instruct' } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured. Please add it in Supabase Edge Function secrets.' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔄 Processing quantum optimization request with OpenRouter AI');
    console.log('📡 Model:', model);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://quantum-fleet-optimizer.com',
        'X-Title': 'Quantum Fleet Optimizer'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a quantum-inspired delivery optimization AI. Analyze delivery routes, partners, and orders to provide quantum-level optimization insights. Focus on:
            1. Route efficiency and distance optimization
            2. Time management and scheduling
            3. Partner allocation and load balancing
            4. Fuel consumption and environmental impact
            5. Quantum algorithm advantages over classical methods
            
            Provide practical, actionable insights in JSON format when requested.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Quantum optimization analysis completed');
    
    const aiResponse = data.choices?.[0]?.message?.content || 'Analysis completed';
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: model,
        timestamp: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process optimization request',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
