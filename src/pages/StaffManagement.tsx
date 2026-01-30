import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  MapPin,
  Key,
  Building,
  Filter,
  MoreVertical,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { staffMembers, hospitalLocations, Staff } from '@/lib/hospitalData';

// Extended staff type with permissions
interface StaffWithPermissions extends Staff {
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  accessLevel: 'standard' | 'elevated' | 'admin';
  allowedLocations: string[];
  permissions: {
    viewPatientRecords: boolean;
    editPatientRecords: boolean;
    accessPharmacy: boolean;
    accessICU: boolean;
    accessOT: boolean;
    accessEmergency: boolean;
    exportData: boolean;
    manageStaff: boolean;
  };
  lastLogin: Date;
  createdAt: Date;
}

// Generate mock staff data with permissions
const generateStaffData = (): StaffWithPermissions[] => {
  return staffMembers.map((staff, index) => ({
    ...staff,
    email: `${staff.name.toLowerCase().replace(/\s+/g, '.').replace('dr.', '')}@hospital.com`,
    phone: `+91 ${9800000000 + index * 111111}`,
    status: index === 5 ? 'inactive' : index === 7 ? 'suspended' : 'active',
    accessLevel: index < 2 ? 'admin' : index < 5 ? 'elevated' : 'standard',
    allowedLocations: hospitalLocations
      .filter(() => Math.random() > 0.3)
      .map(l => l.id),
    permissions: {
      viewPatientRecords: true,
      editPatientRecords: index < 5,
      accessPharmacy: index < 3 || staff.department === 'Laboratory',
      accessICU: staff.department === 'ICU' || staff.role.includes('Surgeon') || index < 2,
      accessOT: staff.role.includes('Surgeon') || staff.role.includes('Anesthesiologist'),
      accessEmergency: staff.department === 'Emergency' || index < 3,
      exportData: index < 4,
      manageStaff: index < 2,
    },
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  }));
};

const departments = ['Surgery', 'Cardiology', 'Emergency', 'Radiology', 'Laboratory', 'ICU', 'Neurology'];
const roles = ['Senior Surgeon', 'Cardiologist', 'Emergency Physician', 'Anesthesiologist', 'Radiologist', 'Head Nurse', 'Pathologist', 'Neurosurgeon', 'Resident', 'Consultant'];

const StaffManagement = () => {
  const [staffData, setStaffData] = useState<StaffWithPermissions[]>(generateStaffData);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStaff, setEditingStaff] = useState<StaffWithPermissions | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter staff
  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.badgeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-success/20 text-success border-success/30',
      inactive: 'bg-muted/50 text-muted-foreground border-border',
      suspended: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getAccessLevelBadge = (level: string) => {
    const variants = {
      admin: 'bg-primary/20 text-primary border-primary/30',
      elevated: 'bg-warning/20 text-warning border-warning/30',
      standard: 'bg-secondary text-foreground border-border',
    };
    return variants[level as keyof typeof variants] || variants.standard;
  };

  const handleEditStaff = (staff: StaffWithPermissions) => {
    setEditingStaff({ ...staff });
    setIsEditDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!editingStaff) return;
    
    setStaffData(prev => prev.map(s => 
      s.id === editingStaff.id ? editingStaff : s
    ));
    setIsEditDialogOpen(false);
    setEditingStaff(null);
    toast.success('Staff profile updated', {
      description: `${editingStaff.name}'s profile has been saved`
    });
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffData(prev => prev.map(s => {
      if (s.id === staffId) {
        const newStatus = s.status === 'active' ? 'suspended' : 'active';
        toast.info(`Status changed to ${newStatus}`, {
          description: `${s.name} is now ${newStatus}`
        });
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleDeleteStaff = (staff: StaffWithPermissions) => {
    setStaffData(prev => prev.filter(s => s.id !== staff.id));
    toast.success('Staff removed', {
      description: `${staff.name} has been removed from the system`
    });
  };

  const stats = {
    total: staffData.length,
    active: staffData.filter(s => s.status === 'active').length,
    inactive: staffData.filter(s => s.status === 'inactive').length,
    suspended: staffData.filter(s => s.status === 'suspended').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Staff Management</h1>
                  <p className="text-xs text-muted-foreground font-mono">
                    Profiles, Departments & Access Control
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-mono font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-mono font-bold text-success">{stats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-mono font-bold text-muted-foreground">{stats.inactive}</p>
                </div>
                <UserX className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-mono font-bold text-destructive">{stats.suspended}</p>
                </div>
                <Shield className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card border-border/50 mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or badge ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Staff Directory
              <Badge variant="outline" className="ml-2 font-mono">
                {filteredStaff.length} results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Staff</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Badge ID</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id} className="border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {staff.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{staff.badgeId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', getAccessLevelBadge(staff.accessLevel))}>
                          {staff.accessLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', getStatusBadge(staff.status))}>
                          {staff.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {staff.lastLogin.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(staff.id)}>
                              {staff.status === 'active' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStaff(staff)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Staff Profile
            </DialogTitle>
            <DialogDescription>
              Update staff information, department, and access permissions
            </DialogDescription>
          </DialogHeader>

          {editingStaff && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editingStaff.name}
                      onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingStaff.email}
                      onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editingStaff.phone}
                      onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge ID</Label>
                    <Input
                      value={editingStaff.badgeId}
                      onChange={(e) => setEditingStaff({ ...editingStaff, badgeId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Department & Role */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Department & Role
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={editingStaff.department} 
                      onValueChange={(v) => setEditingStaff({ ...editingStaff, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select 
                      value={editingStaff.role} 
                      onValueChange={(v) => setEditingStaff({ ...editingStaff, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select 
                      value={editingStaff.accessLevel} 
                      onValueChange={(v: 'standard' | 'elevated' | 'admin') => setEditingStaff({ ...editingStaff, accessLevel: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="elevated">Elevated</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={editingStaff.status} 
                      onValueChange={(v: 'active' | 'inactive' | 'suspended') => setEditingStaff({ ...editingStaff, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Allowed Locations */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Allowed Locations
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {hospitalLocations.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={location.id}
                        checked={editingStaff.allowedLocations.includes(location.id)}
                        onCheckedChange={(checked) => {
                          const newLocations = checked
                            ? [...editingStaff.allowedLocations, location.id]
                            : editingStaff.allowedLocations.filter(l => l !== location.id);
                          setEditingStaff({ ...editingStaff, allowedLocations: newLocations });
                        }}
                      />
                      <Label htmlFor={location.id} className="text-sm">{location.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Access Permissions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(editingStaff.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <Label className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => {
                          setEditingStaff({
                            ...editingStaff,
                            permissions: { ...editingStaff.permissions, [key]: checked }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveStaff}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Staff
            </DialogTitle>
            <DialogDescription>
              This feature requires a database connection.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Enable Lovable Cloud to add and persist new staff members.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
