// DELETE /api/blog/delete?id=uuid — Delete a blog post (admin)
import { getAdminClient, getAuthClientFromReq, getTokenFromReq, handleCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const authClient = getAuthClientFromReq(req);
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing post id' });

  const admin = getAdminClient();
  const { error } = await admin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
