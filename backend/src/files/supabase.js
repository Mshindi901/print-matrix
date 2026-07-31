import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_PROJECT_URL,process.env.SUPABASE_SERVICE_KEY, {
    auth:{
        persistSession:false
    },
    realtime:{
        transport: WebSocket
    }
});

export default supabase;