import { IncomingMessage, ServerResponse } from 'http';
import { userDataService } from '../services/mongoService';
import { sendJSON } from '../utils/helpers';

export const handleUserDataRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;
  const pathParts = pathname.split('/').filter(Boolean);

  try {
    // DELETE /api/userdata/:userId - Clear all data for a specific user
    if (method === 'DELETE' && pathParts[0] === 'api' && pathParts[1] === 'userdata' && pathParts[2]) {
      const userId = pathParts[2];
      
      console.log(`Clearing all data for user: ${userId}`);
      
      const result = await userDataService.clearAllUserData(userId);
      
      if (result.success) {
        console.log(`Successfully cleared data for user ${userId}:`, result.deletedCounts);
        sendJSON(res, 200, {
          message: `Successfully cleared all data for user ${userId}`,
          deletedCounts: result.deletedCounts
        });
      } else {
        sendJSON(res, 500, { error: 'Failed to clear user data' });
      }
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('Error in clear user data route:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
