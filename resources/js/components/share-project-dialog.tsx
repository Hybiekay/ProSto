import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    pivot?: {
        permission: 'view' | 'edit';
    };
}

interface Project {
    id: string;
    shared_users?: User[];
    [key: string]: any;
}

interface ShareProjectDialogProps {
    project: Project;
}

export const ShareProjectDialog = ({ project }: ShareProjectDialogProps) => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [activeTab, setActiveTab] = useState<'invite' | 'manage'>('invite');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        invite: '',
        update: '',
        remove: ''
    });

    // Debounced search function
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.trim() && activeTab === 'invite') {
                setIsSearching(true);
                try {
                    const response = await fetch(`/users/search?q=${encodeURIComponent(search)}&project_id=${project.id}`);
                    const users = await response.json();
                    setSearchResults(users);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, project.id, activeTab]);

    const handleInvite = (userId: string, permission: string) => {
        setLoadingStates(prev => ({ ...prev, invite: userId }));

        router.post(`/projects/${project.id}/invite`, {
            invitee_id: userId,
            permission: permission
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSearch('');
                setSearchResults([]);
                toast.success('Invitation sent successfully!');
                setIsDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to send invitation. Please try again.');
            },
            onFinish: () => {
                setLoadingStates(prev => ({ ...prev, invite: '' }));
            }
        });
    };

    const handleUpdatePermission = (userId: string, permission: 'view' | 'edit') => {
        setLoadingStates(prev => ({ ...prev, update: userId }));

        router.post(`/projects/${project.id}/users/${userId}`, {
            permission: permission,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permission updated successfully!');
                setIsDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to update permission. Please try again.');
            },
            onFinish: () => {
                setLoadingStates(prev => ({ ...prev, update: '' }));
            }
        });
    };

    const handleRemoveUser = (userId: string) => {
        setLoadingStates(prev => ({ ...prev, remove: userId }));

        router.delete(`/projects/${project.id}/users/${userId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User removed from project!');
                setIsDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to remove user. Please try again.');
            },
            onFinish: () => {
                setLoadingStates(prev => ({ ...prev, remove: '' }));
            }
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Share Project
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Project Access</DialogTitle>
                </DialogHeader>

                <div className="flex border-b mb-4">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'invite' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('invite')}
                    >
                        Invite Users
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'manage' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage Users
                    </button>
                </div>

                {activeTab === 'invite' ? (
                    <div className="space-y-4">
                        <Input
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="flex items-center gap-4">
                            <Select
                                value={permission}
                                onValueChange={(value: 'view' | 'edit') => {
                                    setPermission(value);
                                }}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Permission" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">Can View</SelectItem>
                                    <SelectItem value="edit">Can Edit</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {permission === 'view' ? 'Read-only access' : 'Can make changes'}
                            </p>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {isSearching ? (
                                <div className="flex justify-center py-4">
                                    <p className="text-sm text-muted-foreground">Searching...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between border p-2 rounded">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                {user.avatar ? (
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .slice(0, 2)
                                                            .join('')
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleInvite(user.id, permission)}
                                            disabled={loadingStates.invite === user.id}
                                        >
                                            {loadingStates.invite === user.id ? 'Sending...' : 'Invite'}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {search ? 'No users found' : 'Start typing to search for users'}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {project.shared_users && project.shared_users.length > 0 ? (
                                project.shared_users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between border p-2 rounded">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                {user.avatar ? (
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .slice(0, 2)
                                                            .join('')
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={user.pivot?.permission || 'view'}
                                                onValueChange={(value: 'view' | 'edit') => handleUpdatePermission(user.id, value)}
                                                disabled={loadingStates.update === user.id}
                                            >
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="view">View</SelectItem>
                                                    <SelectItem value="edit">Edit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleRemoveUser(user.id)}
                                                disabled={loadingStates.remove === user.id}
                                            >
                                                {loadingStates.remove === user.id ? (
                                                    'Removing...'
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No users have been added to this project yet
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};