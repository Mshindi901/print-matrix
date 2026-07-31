import Print_Agent from "./schema.js";
import crypto from 'crypto';

export const new_agent = async (req, res) => {
    try {
        const {location} = req.body;
        if(!location){
            return res.status(400).json({success:false,message:'Provide location name'});
        };
        const api_key =  crypto.randomBytes(32).toString('hex');
        const hashed_api_key = crypto.createHash('sha256').update(api_key).digest('hex');
        const new_print_agent = await Print_Agent.create({
            location,
            api_key: hashed_api_key
        });
        if(!new_print_agent){
            return res.status(400).json({success:false,message:'Failed to create a new Print agent record'});
        };
        return res.status(201).json({success:true,message:'New Print agent record added', data:new_print_agent});
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server Error',error:error})
    }
};

export const get_agent = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success:false,message:'Provide Printer Id'});
        };
        const agent = await Print_Agent.findByPk(id);
        if(!agent){
            return res.status(400).json({success:false,message:'No agent found'});
        };
        return res.status(200).json({success:true,message:'Agent Fetched',data:agent});
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server Error',error:error})
    }
};

export const get_all_agents = async(req, res) => {
    try {
        const agents = await Print_Agent.findALl();
        if(!agents || agents.length === 0){
            return res.status(400).json({success:false,message:'API failed or No agents records yet'});
        };
        return res.status(200).json({success:true,message:'Agents Fethced', data:agents});
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server Error',error:error})
    }
};

export const get_agent_name = async(req, res) => {
    try {
        const location = req.body;
        if(!location){
            return res.status(400).json({success:false, message:'Provide agent location name'});
        };
        const agent = await Print_Agent.findOne({where:{location}});
        if(!agent){
            return res.status(400).json({success:false,message:'Agent Not Found'})
        };
        return res.status(200).json({success:true,message:"Agent Fetched",data:agent});
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server Error',error:error})
    }
};

export const delete_agent = async(req, res) => {
    try {
        const id = req.params;
        if(!id){
            return res.status(400).json({success:false,message:'Provide Printer Id'});
        };
        const agent = await Print_Agent.findByPk(id);
        if(!agent){
            return res.status(400).json({success:false,message:'No agent found'});
        };
        const delete_agent = await agent.destroy();
        if(!delete_agent){
            return res.status(400).json({success:false,message:'Failed to delete record'});
        };
        return res.status(200).json({success:true,message:'Agent record deleted'})
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server Error',error:error})
    }
};