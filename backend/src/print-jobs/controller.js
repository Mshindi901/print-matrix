import PrintJobs from './schema.js';
import Printers from '../printer/schema.js';

const toJobResponse = (job) => ({
  jobId: job.id,
  userId: job.user_id,
  printerId: job.printer_id,
  status: job.status === 'pending' ? 'queued' : job.status,
  copies: job.copies,
  pageRange: job.page_range,
  startTime: job.createdAt,
});

export const add_job = async (req, res) => {
  try {
    const printerId = req.body.printerId || req.body.printer_id;
    const fileId = req.body.fileId || req.body.file_id;
    const copies = Number(req.body.copies);
    const pageRange = req.body.pageRange || req.body.page_range;
    if (!printerId || !fileId || !Number.isInteger(copies) || copies < 1) {
      return res.status(400).json({ success: false, message: 'Provide a printer, file, and number of copies' });
    }

    const job = await PrintJobs.create({
      user_id: req.user.id,
      printer_id: printerId,
      file_id: fileId,
      copies,
      page_range: pageRange || null,
      status: 'pending',
      submiited_at: new Date(),
    });
    return res.status(201).json({ success: true, message: 'Print job created', jobId: job.id, status: 'queued' });
  } catch (error) {
    console.error('Creating print job failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const get_user_jobs = async (req, res) => {
  try {
    const jobs = await PrintJobs.findAll({ where: { user_id: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, count: jobs.length, jobs: jobs.map(toJobResponse) });
  } catch (error) {
    console.error('Fetching print jobs failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const get_print_jobs_id = async (req, res) => {
  try {
    const job = await PrintJobs.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Print job not found' });
    return res.status(200).json({ success: true, job: toJobResponse(job) });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const delete_job = async (req, res) => {
  try {
    const job = await PrintJobs.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Print job not found' });
    await job.destroy();
    return res.status(200).json({ success: true, message: 'Print job deleted' });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const get_agent_pending_jobs = async (req, res) => {
  try {
    const jobs = await PrintJobs.findAll({ where: { status: 'pending' }, include: [{ model: Printers, as: 'printer', where: { agent_id: req.is_agent.id } }] });
    return res.status(200).json({ success: true, data: jobs });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStatus = (status) => async (req, res) => {
  try {
    const job = await PrintJobs.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Print job not found' });
    job.status = status;
    await job.save();
    return res.status(200).json({ success: true, message: 'Job status updated' });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const jobCompleted = updateStatus('completed');
export const jobDownloading = updateStatus('downloading');
export const jobPrinting = updateStatus('printing');
export const jobFailed = updateStatus('failed');
