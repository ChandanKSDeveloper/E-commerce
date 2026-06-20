import { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import MetaData from "@/components/common/Metadata";
import useUserStore from "../../../store/useUserStore";
import { toast } from "sonner";
import { 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminUsers() {
  const { 
    users, 
    loading, 
    error, 
    user: currentUser,
    getAllUsersAdmin, 
    updateUserRole, 
    deleteUser 
  } = useUserStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user"
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getAllUsersAdmin();
  }, [getAllUsersAdmin]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user"
    });
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }

    setUpdating(true);
    const result = await updateUserRole(selectedUser._id, editForm);
    if (result && result.success) {
      toast.success("User configuration updated successfully!");
      setSelectedUser(null);
    } else {
      toast.error("Failed to update user.");
    }
    setUpdating(false);
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser?._id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      const result = await deleteUser(id);
      if (result && result.success) {
        toast.success(`User "${name}" deleted successfully.`);
      } else {
        toast.error("Failed to delete user.");
      }
    }
  };

  return (
    <>
      <MetaData title="Manage Users - Admin" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Manage Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Verify customer databases, modify user authorizations, or remove obsolete accounts.
            </p>
          </div>

          {loading && users.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Retrieving user roster...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex gap-4 text-red-700 dark:text-red-400">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Users</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No registered users found.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Avatar</th>
                      <th className="py-4 px-6">Profile Details</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Access Level</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                    {users.map((userObj) => (
                      <tr key={userObj._id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition">
                        
                        {/* Avatar */}
                        <td className="py-4 px-6">
                          {userObj.avatar?.url ? (
                            <img 
                              src={userObj.avatar.url} 
                              alt={userObj.name} 
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/10"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
                              {userObj.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </td>

                        {/* Name & ID */}
                        <td className="py-4 px-6">
                          <h4 className="font-semibold text-gray-950 dark:text-white">
                            {userObj.name}
                            {userObj._id === currentUser?._id && (
                              <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{userObj._id}</p>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 font-medium">
                          {userObj.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          {userObj.role === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span>Administrator</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-150 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300">
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Standard User</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenEdit(userObj)}
                              className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                            >
                              <Edit className="h-4.5 w-4.5" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteUser(userObj._id, userObj.name)}
                              disabled={userObj._id === currentUser?._id}
                              className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg disabled:opacity-50"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Edit User Modal Overlay */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border dark:border-gray-700 animate-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Modify Account Profile</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Admin-override panel for access authorization</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseEdit} className="h-8 w-8 rounded-lg">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                  
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name *</label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address *</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  {/* Role Select */}
                  <div className="space-y-1.5">
                    <label htmlFor="role" className="text-xs font-semibold text-gray-400 uppercase">Access Authorization</label>
                    <select
                      id="role"
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      disabled={selectedUser._id === currentUser?._id}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {selectedUser._id === currentUser?._id && (
                      <p className="text-[10px] text-amber-500 font-medium">To protect operations, you cannot revoke your own admin clearance.</p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t dark:border-gray-700 flex gap-2 justify-end">
                    <Button variant="outline" type="button" onClick={handleCloseEdit} className="rounded-xl px-5">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updating} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 flex items-center gap-1.5 font-medium transition"
                    >
                      {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Apply Changes</span>
                    </Button>
                  </div>

                </form>

              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
