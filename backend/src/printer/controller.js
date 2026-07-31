import Printers from './schema.js';

 /*const toPrinterResponse = (printer) => ({
  printerId: printer.id,
  name: printer.name,
  location: printer.location,
  status: printer.status === 'online' ? 'active' : 'offline',
  ipAddress: printer.ip_address,
  agentId: printer.agent_id,
  model: '—',
  supportedFormats: [],
  maxPages: 0,
  currentQueue: 0,
});*/

export const get_all_printers = async (_req, res) => {
  try {
    const printers = await Printers.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json({ success: true, count: printers.length, printers: printers});
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const add_printer = async (req, res) => {
  try {
    const {name, location, ipAddress, agentId} = req.body;
    if (!name || !location || !ipAddress || !agentId) {
      return res.status(400).json({ success: false, message: 'Name, location, IP address, and agent ID are required' });
    }
    const existing = await Printers.findOne({ where: { ip_address: ipAddress } });
    if (existing) return res.status(409).json({ success: false, message: 'A printer with that IP address already exists' });
    const printer = await Printers.create({ name, location, ip_address: ipAddress, agent_id: agentId, status: 'online' });
    return res.status(201).json({ success: true, message: 'Printer added', printer: printer });
  } catch (error) {
    console.error('Adding printer failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const get_printer_by_id = async (req, res) => {
  try {
    const printer = await Printers.findByPk(req.params.id);
    if (!printer) return res.status(404).json({ success: false, message: 'Printer not found' });
    return res.status(200).json({ success: true, printer: toPrinterResponse(printer) });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const get_printer_by_name = async (req, res) => {
  try {
    const printer = await Printers.findOne({ where: { name: req.query.name } });
    if (!printer) return res.status(404).json({ success: false, message: 'Printer not found' });
    return res.status(200).json({ success: true, printer: toPrinterResponse(printer) });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const get_printer_by_ip = async (req, res) => {
  try {
    const printer = await Printers.findOne({ where: { ip_address: req.query.ipAddress } });
    if (!printer) return res.status(404).json({ success: false, message: 'Printer not found' });
    return res.status(200).json({ success: true, printer: toPrinterResponse(printer) });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const update_printer_status = async (req, res) => {
  try {
    const status = req.body.status === 'active' || req.body.status === 'online' ? 'online' : 'offline';
    const printer = await Printers.findByPk(req.params.id);
    if (!printer) return res.status(404).json({ success: false, message: 'Printer not found' });
    printer.status = status;
    await printer.save();
    return res.status(200).json({ success: true, message: 'Printer status updated', printer: toPrinterResponse(printer) });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const delete_printer = async (req, res) => {
  try {
    const printer = await Printers.findByPk(req.params.id);
    if (!printer) return res.status(404).json({ success: false, message: 'Printer not found' });
    await printer.destroy();
    return res.status(200).json({ success: true, message: 'Printer deleted' });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};
