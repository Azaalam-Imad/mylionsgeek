import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Edit, Share2, Plus, X, Pin, PinOff, MessageSquare, Paperclip, CheckSquare, Calendar, User, Tag, CheckCircle, Clock, AlertCircle, MoreHorizontal, Eye, Trash2, AtSign, Star, Flag, Zap, UploadCloud, Download, Archive, Image, File, FileCode, FileSpreadsheet, FileAudio, FileVideo, FileArchive, FileQuestion } from 'lucide-react';
import { useForm, router, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Helper to get file icon based on type
const getFileIcon = (mimeType, fileName) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('text')) return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp4': case 'avi': case 'mov': return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp3': case 'wav': return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'pdf': return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'xls': case 'xlsx': case 'csv': return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'js': case 'ts': case 'jsx': case 'tsx': case 'html': case 'css': case 'json': case 'php': return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'zip': case 'rar': case '7z': return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        default: return <File className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    }
};

// Helper to format relative time
const formatRelativeTime = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
        return 'Yesterday at ' + format(date, 'HH:mm');
    } else if (Date.now() - date.getTime() < 2 * 24 * 60 * 60 * 1000) { // Less than 2 days ago
        return formatDistanceToNow(date, { addSuffix: true });
    } else {
        return format(date, 'd/M/y HH:mm');
    }
};

// Helper component for sidebar buttons
const SidebarButton = ({ icon: Icon, label, onClick, isActive = false }) => (
    <Button
        onClick={onClick}
        variant="ghost"
        className={`w-full justify-start text-sm ${isActive ? 'bg-alpha/20 text-alpha hover:bg-alpha/30' : 'bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white'}`}
    >
        <Icon className="h-4 w-4 mr-2" />
        {label}
    </Button>
);

// Helper component for member popover
const MemberPopover = ({ teamMembers = [], selectedAssignees = [], onToggleAssignee, onClose }) => {
    const [search, setSearch] = useState('');
    const filteredMembers = teamMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute z-20 w-72 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 p-3 top-0 left-full ml-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">Members</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Input
                placeholder="Search members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 mb-2"
            />
            <ScrollArea className="h-48">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 block px-1 py-1">Board members</span>
                    {filteredMembers.map(member => {
                        const isSelected = selectedAssignees.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={() => onToggleAssignee(member.id)}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-700 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={member.image ? `/storage/${member.image}` : null} alt={member.name} />
                                        <AvatarFallback className="text-xs bg-zinc-600 text-white">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-white">{member.name}</span>
                                </div>
                                {isSelected && <CheckCircle className="h-4 w-4 text-alpha" />}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

// Helper component for attachment popover
const AttachPopover = ({ onClose, onFileUpload }) => {
    const [fileInput, setFileInput] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFileUpload(files);
            onClose();
        }
    };

    return (
        <div className="absolute z-20 w-72 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 p-3 top-0 left-full ml-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">Attach</span>
                <Button onClick={onClose} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => fileInput?.click()}
                    className="w-full justify-start text-sm bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Attach a file from your computer
                </Button>
                <input
                    ref={setFileInput}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Input
                    placeholder="Search or paste a link"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                />
            </div>
        </div>
    );
};

const TaskModal = ({
    projectId,
    setSelectedTask,
    isOpen,
    onClose,
    selectedTask,
    teamMembers = [],
    onUpdateTask
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [newTag, setNewTag] = useState('');
    const [showSubtasks, setShowSubtasks] = useState(true);
    const [showAttachments, setShowAttachments] = useState(true);
    const [showMembersPopover, setShowMembersPopover] = useState(false);
    const [showAttachPopover, setShowAttachPopover] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

    const { data: taskData, setData: setTaskData, put: updateTask, processing: isUpdating, reset } = useForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignees: [],
        subtasks: [],
        tags: [],
        attachments: [],
        comments: [],
        is_pinned: false,
        progress: 0,
        due_date: ''
    });

    const { auth } = usePage().props;

    // Update form data when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setTaskData({
                title: selectedTask.title || '',
                description: selectedTask.description || '',
                priority: selectedTask.priority || 'medium',
                status: selectedTask.status || 'todo',
                assignees: selectedTask.assignees?.map(a => a.id) || [],
                subtasks: selectedTask.subtasks || [],
                tags: selectedTask.tags || [],
                attachments: selectedTask.attachments || [],
                comments: selectedTask.comments || [],
                is_pinned: selectedTask.is_pinned || false,
                progress: selectedTask.progress || 0,
                due_date: selectedTask.due_date || ''
            });
            // Ensure subtasks are shown if they exist
            if (selectedTask.subtasks?.length > 0) {
                setShowSubtasks(true);
            }
        }
    }, [selectedTask]);

    const updateTaskData = (data) => {
        setTaskData(data);
    };

    const updateSelectedTask = (data) => {
        setSelectedTask(data);
    };

    if (!selectedTask) return null;

    // Priority and Status helpers
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent': return <Zap className="h-3 w-3" />;
            case 'high': return <Flag className="h-3 w-3" />;
            case 'medium': return <Star className="h-3 w-3" />;
            case 'low': return <CheckCircle className="h-3 w-3" />;
            default: return <Star className="h-3 w-3" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
            case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
            case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
            case 'todo': return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
            default: return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            case 'high': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-3 w-3" />;
            case 'in_progress': return <Clock className="h-3 w-3" />;
            case 'review': return <AlertCircle className="h-3 w-3" />;
            case 'todo': return <CheckSquare className="h-3 w-3" />;
            default: return <CheckSquare className="h-3 w-3" />;
        }
    };

    // Update handlers
    const handleUpdateTitle = () => {
        if (taskData.title === selectedTask.title) {
            setIsEditingTitle(false);
            return;
        }
        router.patch(`/admin/tasks/${selectedTask.id}/title`, {
            title: taskData.title
        }, {
            onSuccess: () => {
                updateTask()
                setIsEditingTitle(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdateDescription = () => {
        router.patch(`/admin/tasks/${selectedTask.id}/description`, {
            description: taskData.description
        }, {
            onSuccess: () => {
                updateTask()
                setIsEditingDescription(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdatePriority = (priority) => {
        setTaskData('priority', priority);
        router.patch(`/admin/tasks/${selectedTask.id}/priority`, {
            priority: priority
        }, {
            onSuccess: () => {
                updateTask()
                setIsEditingPriority(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdateStatus = (status) => {
        setTaskData('status', status);
        router.patch(`/admin/tasks/${selectedTask.id}/status`, {
            status: status
        }, {
            onSuccess: () => {
                updateTask()
                setIsEditingStatus(false);
                onUpdateTask?.();
            }
        });
    };

    const handleToggleAssignee = (memberId) => {
        const currentAssignees = taskData.assignees;
        const newAssignees = currentAssignees.includes(memberId)
            ? currentAssignees.filter(id => id !== memberId)
            : [...currentAssignees, memberId];

        setTaskData('assignees', newAssignees);

        router.patch(`/admin/tasks/${selectedTask.id}/assignees`, {
            assignees: newAssignees
        }, {
            onSuccess: () => {
                updateTask()
                onUpdateTask?.();
            }
        });
    };

    const handleTogglePin = () => {
        const newPinnedState = !taskData.is_pinned;
        setTaskData('is_pinned', newPinnedState);

        router.post(`/admin/tasks/${selectedTask.id}/pin`, {}, {
            onSuccess: () => {
                updateTask()
                onUpdateTask?.();
            }
        });
    };

    const handleShare = () => {
        const taskUrl = `${window.location.origin}/admin/projects/${selectedTask.project_id}/tasks/${selectedTask.id}`;
        navigator.clipboard.writeText(taskUrl).then(() => {
            // You could add a toast notification here
            console.log('Task URL copied to clipboard');
        });
    };

    // Comment handlers
    const handleAddComment = () => {
        if (!newComment.trim()) return;

        if (editingComment) {
            // Update existing comment
            const updatedComments = (taskData.comments || []).map(comment => 
                comment.id === editingComment.id 
                    ? { ...comment, content: newComment, updated_at: new Date().toISOString() }
                    : comment
            );
            setTaskData('comments', updatedComments);
            setNewComment('');
            setEditingComment(null);

            // Send to backend
            router.put(`/admin/tasks/${selectedTask.id}/comments/${editingComment.id}`, {
                content: newComment
            }, {
                onSuccess: () => {
                    updateTask();
                }
            });
        } else {
            // Add new comment
            const newCommentItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                content: newComment,
                user_id: 1, // Current user ID
                user: { id: 1, name: 'Current User', email: 'user@example.com', image: null },
                created_at: new Date().toISOString()
            };

            // Update UI instantly
            setTaskData('comments', [...(taskData.comments || []), newCommentItem]);
            setNewComment('');

            // Send to backend
            router.post(`/admin/tasks/${selectedTask.id}/comments`, {
                content: newComment
            }, {
                onSuccess: () => {
                    updateTask();
                }
            });
        }
    };

    // Subtask handlers
    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;

        const newSubtaskItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: newSubtask,
            completed: false
        };

        // Update UI instantly
        setTaskData('subtasks', [...(taskData.subtasks || []), newSubtaskItem]);
        setNewSubtask('');

        // Send to backend
        router.post(`/admin/tasks/${selectedTask.id}/subtasks`, {
            title: newSubtask
        }, {
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const handleToggleSubtask = (subtaskId) => {
        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).map(subtask => 
            subtask.id === subtaskId 
                ? { ...subtask, completed: !subtask.completed }
                : subtask
        );
        setTaskData('subtasks', updatedSubtasks);

        // Send to backend
        router.put(`/admin/tasks/${selectedTask.id}/subtasks`, {
            subtask_id: subtaskId,
            completed: updatedSubtasks.find(s => s.id === subtaskId)?.completed
        }, {
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const handleDeleteSubtask = (subtaskId) => {
        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).filter(subtask => subtask.id !== subtaskId);
        setTaskData('subtasks', updatedSubtasks);

        // Send to backend
        router.delete(`/admin/tasks/${selectedTask.id}/subtasks`, {
            data: { subtask_id: subtaskId }
        }, {
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const handleEditSubtask = (subtask) => {
        setEditingSubtask(subtask);
        setEditingSubtaskTitle(subtask.title);
    };

    const handleUpdateSubtask = () => {
        if (!editingSubtaskTitle.trim()) return;

        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).map(subtask => 
            subtask.id === editingSubtask.id 
                ? { ...subtask, title: editingSubtaskTitle }
                : subtask
        );
        setTaskData('subtasks', updatedSubtasks);
        setEditingSubtask(null);
        setEditingSubtaskTitle('');

        // Send to backend
        router.put(`/admin/tasks/${selectedTask.id}/subtasks`, {
            subtask_id: editingSubtask.id,
            title: editingSubtaskTitle
        }, {
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const getSubtaskProgress = () => {
        if (!selectedTask.subtasks || selectedTask.subtasks.length === 0) return 0;
        const completed = selectedTask.subtasks.filter(s => s.completed).length;
        return Math.round((completed / selectedTask.subtasks.length) * 100);
    };

    // Tag handlers
    const handleAddTag = () => {
        if (!newTag.trim() || taskData.tags.includes(newTag.trim())) return;

        const newTags = [...taskData.tags, newTag.trim()];
        setTaskData('tags', newTags);

        router.put(`/admin/tasks/${selectedTask.id}`, {
            tags: newTags
        }, {
            onSuccess: () => {
                updateTask()
                setNewTag('');
                onUpdateTask?.();
            }
        });
    };

    const handleRemoveTag = (tagToRemove) => {
        const newTags = taskData.tags.filter(tag => tag !== tagToRemove);
        setTaskData('tags', newTags);

        router.put(`/admin/tasks/${selectedTask.id}`, {
            tags: newTags
        }, {
            onSuccess: () => {
                updateTask()
                onUpdateTask?.();
            }
        });
    };

    // File upload handlers
    const handleFileUpload = (files) => {
        const newAttachments = Array.from(files).map(file => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            path: URL.createObjectURL(file), // Temporary URL for preview
            uploaded_by: 1, // Current user ID
            uploaded_at: new Date().toISOString()
        }));

        // Update UI instantly
        setTaskData('attachments', [...(taskData.attachments || []), ...newAttachments]);

        // Send to backend
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file);
        });

        router.post(`/admin/tasks/${selectedTask.id}/attachments`, formData, {
            forceFormData: true,
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const handleRemoveAttachment = (attachmentId) => {
        // Update UI instantly
        const updatedAttachments = (taskData.attachments || []).filter(attachment => attachment.id !== attachmentId);
        setTaskData('attachments', updatedAttachments);

        // Send to backend
        router.delete(`/admin/tasks/${selectedTask.id}/attachments`, {
            data: { attachment_id: attachmentId }
        }, {
            onSuccess: () => {
                updateTask();
            }
        });
    };

    const handleUserClick = (user) => {
        if (user) {
            setSelectedUser(user);
            setShowUserModal(true);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setNewComment(comment.content);
    };

    const handleDeleteComment = (commentId) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            // Update UI instantly
            const updatedComments = (taskData.comments || []).filter(comment => comment.id !== commentId);
            setTaskData('comments', updatedComments);

            // Send to backend
            router.delete(`/admin/tasks/${selectedTask.id}/comments/${commentId}`, {}, {
                onSuccess: () => {
                    updateTask();
                }
            });
        }
    };

    const handleArchiveTask = () => {
        if (confirm('Are you sure you want to archive this task?')) {
            router.patch(`/admin/tasks/${selectedTask.id}/status`, { status: 'archived' }, {
                onSuccess: () => {
                    updateTask()
                    onUpdateTask?.();
                    onClose();
                }
            });
        }
    };

    const handleDeleteTask = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/admin/tasks/${selectedTask.id}`, {
                onSuccess: () => {
                    updateTask()
                    onUpdateTask?.();
                    onClose();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl max-h-[90vh] !w-[90vw] p-0 bg-background border-border shadow-2xl rounded-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-light dark:bg-dark">
                    <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadgeClass(taskData.status)}`}>
                            {getStatusIcon(taskData.status)}
                            {taskData.status.replace('_', ' ').toUpperCase()}
                        </div>

                        {/* Priority Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityBadgeClass(taskData.priority)}`}>
                            {getPriorityIcon(taskData.priority)}
                            {taskData.priority.toUpperCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleTogglePin} className="text-dark dark:text-light hover:bg-alpha/20">
                            {taskData.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleShare} className="text-dark dark:text-light hover:bg-alpha/20">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-dark dark:text-light hover:bg-alpha/20">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleArchiveTask()}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTask()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-dark dark:text-light hover:bg-alpha/20">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[75vh] bg-background">
                    {/* Left Column - Professional Elegant Design */}
                    <div className="flex-1 bg-gradient-to-br from-light via-light to-gray-50 dark:from-dark dark:via-dark dark:to-dark_gray py-8 pl-8 pr-6 space-y-8">
                        <ScrollArea className="h-full pr-4">
                            {/* Task Title - Elegant Design */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-alpha to-alpha/60 rounded-full"></div>
                                    <label className="text-xs font-semibold text-dark/80 dark:text-light/80 capitalize tracking-wider">Task Title</label>
                                </div>
                                {isEditingTitle ? (
                                    <div className="space-y-4 py-3">
                                        <Input
                                            value={taskData.title}
                                            onChange={(e) => setTaskData('title', e.target.value)}
                                            onBlur={handleUpdateTitle}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                            autoFocus
                                            className="text-2xl font-bold bg-neutral-200 dark:bg-neutral-800 border-alpha/40 text-dark dark:text-light focus-visible:ring-alpha/50 focus-visible:ring-2 rounded-xl px-6 py-4"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleUpdateTitle}
                                                disabled={isUpdating}
                                                className="bg-gradient-to-r from-alpha to-alpha/80 hover:from-alpha/90 hover:to-alpha/70 text-dark font-semibold px-6 py-2 rounded-lg shadow-lg"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/10 px-6 py-2 rounded-lg">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingTitle(true)}
                                        className="group px-6 py-2 bg-neutral-200 dark:bg-neutral-800 dark:to-dark/40 rounded-xl border border-alpha/20 cursor-pointer hover:from-alpha/10 hover:to-alpha/5 hover:border-alpha/40 transition-all duration-300 backdrop-blur-sm"
                                    >
                                        <h1 className="text-xl  font-bold text-dark group-hover:text-alpha dark:text-light transition-colors">
                                            {selectedTask.title || 'Untitled Task'}
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Description - Elegant Design */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-alpha to-alpha/60 rounded-full"></div>
                                    <label className="text-xs font-semibold text-dark/80 dark:text-light/80 capitalize tracking-wider">Description</label>
                                </div>
                                {isEditingDescription ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={taskData.description}
                                            onChange={(e) => setTaskData('description', e.target.value)}
                                            placeholder="Add a more detailed description..."
                                            rows={5}
                                            className="bg-neutral-200 dark:bg-neutral-800 border-alpha/40 text-dark dark:text-light placeholder:text-dark/60 dark:placeholder:text-light/60 focus-visible:ring-alpha focus-visible:ring-2 rounded-xl px-6 py-4 resize-none"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleUpdateDescription}
                                                disabled={isUpdating}
                                                className="bg-gradient-to-r from-alpha to-alpha/80 hover:from-alpha/90 hover:to-alpha/70 text-dark font-semibold px-6 py-2 rounded-lg shadow-lg"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsEditingDescription(false)} className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/10 px-6 py-2 rounded-lg">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDescription(true)}
                                        className="group shadow-lg px-6 py-3 bg-neutral-200 dark:bg-neutral-800 dark:from-dark/60 dark:to-dark/40 rounded-xl border border-alpha/20 cursor-pointer hover:from-alpha/10 hover:to-alpha/5 hover:border-alpha/40 transition-all duration-300 backdrop-blur-sm min-h-[120px]"
                                    >
                                        {selectedTask.description ? (
                                            <p className="text-dark text-sm leading-relaxed group-hover:text-alpha/90 dark:text-light/80 transition-colors">{selectedTask.description}</p>
                                        ) : (
                                            <p className="text-dark/60 italic group-hover:text-dark/80 dark:text-light/60 dark:group-hover:text-light/80 transition-colors">Add a more detailed description...</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Checklist - Elegant Design */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-gradient-to-b from-alpha to-alpha/60 rounded-full"></div>
                                            <CheckSquare className="h-5 w-5 text-alpha" />
                                            <h3 className="text-lg font-bold text-dark dark:text-light">Checklist</h3>
                                        </div>
                                        <div className="px-3 py-1 dark:bg-alpha/20 bg-dark/80 rounded-lg">
                                            <span className="text-sm font-semibold text-alpha">{getSubtaskProgress()}% complete</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowSubtasks(!showSubtasks)} className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/20 text-sm px-4 py-2 rounded-lg">
                                        {showSubtasks ? 'Hide' : 'Show'}
                                    </Button>
                                </div>

                                {showSubtasks && (
                                    <div className="space-y-4">
                                        {/* Add New Subtask - Elegant */}
                                        <div className="flex gap-4 p-2 bg-gradient-to-r from-light/60 to-light/40 dark:from-dark/60 dark:to-dark/40 rounded-xl border border-alpha/30 hover:border-alpha/50 transition-all duration-300">
                                            <Input
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                                placeholder="Add a new checklist item..."
                                                className="flex-1 bg-neutral-200 dark:bg-neutral-800 border-0 text-dark dark:text-light placeholder:text-dark/60 dark:placeholder:text-light/60 focus-visible:ring-alpha focus-visible:ring-2 rounded-lg px-4 py-3"
                                            />
                                            <Button onClick={handleAddSubtask} className="bg-gradient-to-r from-alpha to-alpha/80 hover:from-alpha/90 hover:to-alpha/70 text-dark font-semibold px-6 py-3 rounded-lg shadow-lg">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Item
                                            </Button>
                                        </div>

                                        {/* Progress Bar - Elegant */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-dark/80 dark:text-light/80">Progress</span>
                                                <span className="text-sm font-bold text-alpha">{getSubtaskProgress()}%</span>
                                            </div>
                                            <Progress value={getSubtaskProgress()} className="h-2 bg-light/40 dark:bg-dark/40 rounded-full overflow-hidden" indicatorClassName="bg-gradient-to-r from-alpha to-alpha/80" />
                                        </div>

                                        {/* Subtasks List - Elegant */}
                                        <div className="space-y-3">
                                            {(taskData.subtasks || []).map(subtask => (
                                                <div key={subtask.id} className="flex items-center gap-4 p-4 bg-neutral-200/80 dark:bg-neutral-800/80 dark:from-dark/60 dark:to-dark/40 hover:from-alpha/10 hover:to-alpha/5 rounded-xl group transition-all duration-300 border border-alpha/20 hover:border-alpha/40 backdrop-blur-sm">
                                                    <Checkbox
                                                        id={`subtask-${subtask.id}`}
                                                        checked={subtask.completed}
                                                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                                                        className="border-alpha/40 data-[state=checked]:bg-alpha data-[state=checked]:border-alpha w-5 h-5 rounded-md"
                                                    />
                                                    {editingSubtask?.id === subtask.id ? (
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <Input
                                                                value={editingSubtaskTitle}
                                                                onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleUpdateSubtask()}
                                                                onBlur={handleUpdateSubtask}
                                                                autoFocus
                                                                className="flex-1 bg-neutral-200 dark:bg-neutral-800 border-alpha/40 text-dark dark:text-light focus-visible:ring-alpha focus-visible:ring-2 rounded-lg px-4 py-2"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={handleUpdateSubtask}
                                                                className="bg-gradient-to-r from-alpha to-alpha/80 hover:from-alpha/90 hover:to-alpha/70 text-dark font-semibold px-4 py-2 rounded-lg"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => { setEditingSubtask(null); setEditingSubtaskTitle(''); }}
                                                                className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/10 px-4 py-2 rounded-lg"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <label
                                                                htmlFor={`subtask-${subtask.id}`}
                                                                className={`flex-1 text-sm font-medium cursor-pointer transition-colors ${subtask.completed ? 'line-through text-dark/50 dark:text-light/50' : 'text-dark group-hover:text-alpha/90 dark:text-light'}`}
                                                            >
                                                                {subtask.title}
                                                            </label>
                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditSubtask(subtask)}
                                                                    className="h-8 w-8 text-dark/60 dark:text-light/60 hover:text-alpha hover:bg-alpha/20 rounded-lg"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteSubtask(subtask.id)}
                                                                    className="h-8 w-8 text-dark/60 dark:text-light/60 hover:text-error hover:bg-error/20 rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attachments - Elegant Design */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-gradient-to-b from-alpha to-alpha/60 rounded-full"></div>
                                            <Paperclip className="h-5 w-5 text-alpha" />
                                            <h3 className="text-lg font-bold text-dark dark:text-light">Attachments</h3>
                                        </div>
                                        <div className="px-3 py-1 dark:bg-alpha/20 bg-dark/80 rounded-lg">
                                            <span className="text-sm font-semibold text-alpha">{(taskData.attachments || []).length} files</span>
                                        </div>
                                    </div>
                                     {/* Upload Button */}
                                     <div className="  border border-alpha/20 rounded-lg">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="inline-flex items-center px-4 py-2  border border-zinc-700 text-sm font-medium rounded-md text-neutral-800 dark:text-light hover:text-white hover:bg-zinc-700 cursor-pointer transition-colors"
                                            >
                                                <UploadCloud className="h-4 w-4 mr-2" />
                                                Upload Files
                                            </label>
                                        </div>
                                    {/* <Button variant="ghost" size="sm" onClick={() => setShowAttachments(!showAttachments)} className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/20 text-sm px-4 py-2 rounded-lg">
                                        {showAttachments ? 'Hide' : 'Show'}
                                    </Button> */}
                                </div>

                                {showAttachments && (
                                    <div className="space-y-3">
                                        {(taskData.attachments || []).length > 0 ? (
                                            (taskData.attachments || []).map(attachment => (
                                                <div key={attachment.id} className="flex items-center justify-between p-4 bg-neutral-200/80 dark:bg-neutral-800/80 dark:from-dark/60 dark:to-dark/40 border border-alpha/20 rounded-xl hover:border-alpha/40 group transition-all duration-300 backdrop-blur-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-light/30 dark:bg-zinc-700 rounded-lg">
                                                            {getFileIcon(attachment.type, attachment.name)}
                                                        </div>
                                                        <div>
                                                            {attachment.type && attachment.type.startsWith('image/') ? (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <p className="text-dark font-medium dark:text-light cursor-pointer hover:text-alpha transition-colors">{attachment.name}</p>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0 bg-white border-none shadow-none">
                                                                        <img src={`/storage/${attachment.path}`} alt={attachment.name} className="max-w-xs max-h-xs rounded-lg shadow-xl" />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            ) : (
                                                                <p className="text-dark font-medium dark:text-light">{attachment.name}</p>
                                                            )}
                                                            <p className="text-xs text-dark/50 dark:text-zinc-400">
                                                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a className='text-dark/60 dark:text-alpha hover:text-alpha dark:hover:text-alpha hover:bg-alpha/20 p-2 rounded-md' download={true} href={`/storage/${attachment.path}`} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-5 w-5" />
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveAttachment(attachment.id)}
                                                            className="h-9 w-9 text-dark/60 dark:text-red-400 hover:text-error hover:bg-error/20 rounded-md"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 border-2 border-dashed border-alpha/30 rounded-xl bg-gradient-to-br from-light/40 to-light/20 dark:from-dark/40 dark:to-dark/20 hover:from-alpha/10 hover:to-alpha/5 transition-all duration-300 group">
                                                <UploadCloud className="h-20 w-20 text-alpha/60 mx-auto mb-6 group-hover:text-alpha transition-colors" />
                                                <p className="text-lg font-semibold text-dark/80 mb-2 group-hover:text-dark dark:text-light/80 dark:group-hover:text-light transition-colors">No attachments yet</p>
                                                <p className="text-sm text-dark/50 mb-8 group-hover:text-dark/70 dark:text-light/50 dark:group-hover:text-light/70 transition-colors">Drag and drop files here or click to upload</p>
                                                <Button
                                                    onClick={() => document.getElementById('file-upload').click()}
                                                    className="bg-gradient-to-r from-alpha to-alpha/80 hover:from-alpha/90 hover:to-alpha/70 text-dark font-semibold px-8 py-3 rounded-lg shadow-lg"
                                                >
                                                    <UploadCloud className="h-5 w-5 mr-3" />
                                                    Upload Files
                                                </Button>
                                            </div>
                                        )}

                                       
                                    </div>
                                )}
                            </div>

                        </ScrollArea>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/3 p-6 space-y-6 border-l border-alpha/20 bg-light dark:bg-dark">
                        {/* Action Buttons */}
                        <div className="space-y-2 pt-6 sticky top-0">
                            <div className="relative">

                                {/* Members */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-dark dark:text-light mb-3">Members</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selectedTask.assignees?.map(assignee => (
                                            <Avatar key={assignee.id} className="h-8 w-8 cursor-pointer" onClick={() => handleUserClick(assignee)}>
                                                <AvatarImage src={assignee.image ? `/storage/${assignee.image}` : null} alt={assignee.name} />
                                                <AvatarFallback className="text-xs bg-alpha/20 text-dark dark:text-light">{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowMembersPopover(true)}
                                            className="h-8 w-8 bg-alpha/20 hover:bg-alpha/30 text-dark dark:text-light rounded-full"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>

                                        {showMembersPopover && (
                                            <MemberPopover
                                                teamMembers={teamMembers}
                                                selectedAssignees={taskData.assignees}
                                                onToggleAssignee={handleToggleAssignee}
                                                onClose={() => setShowMembersPopover(false)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {showMembersPopover && (
                                    <MemberPopover
                                        teamMembers={teamMembers}
                                        selectedAssignees={taskData.assignees}
                                        onToggleAssignee={handleToggleAssignee}
                                        onClose={() => setShowMembersPopover(false)}
                                    />
                                )}
                            </div>

                        </div>

                        {/* Comments & Activity */}
                        <div className="">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-dark dark:text-light">Comments</h3>
                            </div>

                           {/* New Comment Input */}
                           <div className="mb-4">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                    className="bg-neutral-200 dark:bg-neutral-800 border-alpha/20 text-dark dark:text-light placeholder:text-dark/60 dark:placeholder:text-light/60 focus-visible:ring-alpha"
                                />
                                {newComment && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button onClick={handleAddComment} className="bg-alpha hover:bg-alpha/90 text-dark">
                                            {editingComment ? 'Update' : 'Save'}
                                        </Button>
                                        <Button variant="ghost" onClick={() => { setNewComment(''); setEditingComment(null); }} className="text-dark dark:text-light hover:bg-alpha/20">
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Activity Feed */}
                            <ScrollArea className="h-[calc(75vh-300px)]">
                                <div className="space-y-4">
                                    {(taskData.comments || []).map(comment => (
                                        <div key={comment.id} className="flex gap-4 p-4 bg-gradient-to-r from-light/60 to-light/40 dark:from-dark/60 dark:to-dark/40 rounded-xl border border-alpha/20 hover:border-alpha/40 group transition-all duration-300 backdrop-blur-sm">
                                            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => handleUserClick(comment.user)}>
                                                <AvatarImage src={comment.user?.image ? `/storage/${comment.user.image}` : null} alt={comment.user?.name} />
                                                <AvatarFallback className="text-xs bg-alpha/20 text-dark dark:text-light">{comment.user?.name?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span 
                                                        className="text-xs font-medium text-dark dark:text-light cursor-pointer hover:text-alpha transition-colors"
                                                        // onClick={}
                                                    >
                                                        {comment.user?.name === auth.user.name ? 'You' : comment.user?.name || 'Unknown User'}
                                                    </span>
                                                    <span className="text-xs text-dark/50 dark:text-light/50">
                                                        {formatRelativeTime(comment.created_at)}
                                                    </span>
                                                </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditComment(comment)} className="h-7 w-7 text-dark/60 dark:text-light/60 hover:text-alpha hover:bg-alpha/20 rounded-md">
                                                            <Edit className="h-2 w-2" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(comment.id)} className="h-7 w-7 text-dark/60 dark:text-light/60 hover:text-error hover:bg-error/20 rounded-md">
                                                            <Trash2 className="h-2 w-2" />
                                                        </Button>
                                                    </div>
                                                <p className="text-dark/80 dark:text-light/80 leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}


                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

            </DialogContent>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                    <DialogContent className="max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-dark dark:text-light">User Profile</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowUserModal(false)} className="text-dark dark:text-light hover:bg-alpha/20">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedUser.image ? `/storage/${selectedUser.image}` : null} alt={selectedUser.name} />
                                    <AvatarFallback className="text-lg bg-alpha/20 text-dark dark:text-light">
                                        {selectedUser.name?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold text-dark dark:text-light">{selectedUser.name}</h3>
                                    <p className="text-sm text-dark/60 dark:text-light/60">{selectedUser.email}</p>
                                    {selectedUser.role && (
                                        <Badge className="mt-1 bg-alpha/20 text-dark dark:text-light border-alpha/30">
                                            {selectedUser.role}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-dark dark:text-light">Email</label>
                                    <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.email}</p>
                                </div>

                                {selectedUser.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-dark dark:text-light">Phone</label>
                                        <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.phone}</p>
                                    </div>
                                )}

                                {selectedUser.cin && (
                                    <div>
                                        <label className="text-sm font-medium text-dark dark:text-light">CIN</label>
                                        <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.cin}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
};

export default TaskModal;