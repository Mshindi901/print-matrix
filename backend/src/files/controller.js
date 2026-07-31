import Files from './schema.js';
import supabase from './supabase.js';

const toFileResponse = (file) => ({
  fileId: file.id,
  fileName: file.file_name,
  fileSize: file.file_size,
  uploadedAt: file.createdAt,
  fileUrl: file.file_url,
});

export const fileUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Provide a file to upload' });

    const fileName = `${req.user.id}-${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage.from('bucket').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) return res.status(400).json({ success: false, message: error.message || 'File storage upload failed' });

    const file = await Files.create({
      file_name: req.file.originalname,
      uploaded_by: req.user.id,
      file_url: data.path,
      file_size: req.file.size,
      status: 'pending',
    });
    return res.status(201).json({ success: true, message: 'File uploaded', ...toFileResponse(file) });
  } catch (error) {
    console.error('File upload failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const usersFiles = async (req, res) => {
  try {
    const files = await Files.findAll({ where: { uploaded_by: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, count: files.length, files: files.map(toFileResponse) });
  } catch (error) {
    console.error('Fetching user files failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFileInfoById = async (req, res) => {
  try {
    const file = await Files.findOne({ where: { id: req.params.id, uploaded_by: req.user.id } });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    return res.status(200).json({ success: true, file: toFileResponse(file) });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteFileRecord = async (req, res) => {
  try {
    const file = await Files.findOne({ where: { id: req.params.id, uploaded_by: req.user.id } });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    await file.destroy();
    return res.status(200).json({ success: true, message: 'File deleted' });
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const download_files = async (req, res) => {
  try {
    const file = await Files.findByPk(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    const { data, error } = await supabase.storage.from('bucket').download(file.file_url);
    if (error) return res.status(400).json({ success: false, message: 'File download failed' });
    return res.send(Buffer.from(await data.arrayBuffer()));
  } catch {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
