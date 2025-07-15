"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Key, Globe, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
}

interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  domain?: string;
  repository?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  hourlyRate?: number;
  technology: string[];
  apiBaseUrl?: string;
  dbConnectionString?: string;
  dbType?: string;
  assignedToId?: string;
  status?: string;
  apiEndpoints?: ApiEndpoint[];
}

interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  domain?: string;
  repository?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  hourlyRate?: number;
  technology: string[];
  apiBaseUrl?: string;
  dbConnectionString?: string;
  dbType?: string;
  assignedToId?: string;
  status: string;
  apiEndpoints?: ApiEndpoint[];
}

interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

const PROJECT_STATUSES = [
  'PLANNING',
  'IN_PROGRESS', 
  'TESTING',
  'DEPLOYMENT',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED'
];

const DB_TYPES = [
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'SQLite',
  'Redis',
  'Prisma',
  'Supabase'
];

const COMMON_TECHNOLOGIES = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Fastify', 'NestJS',
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'Vercel', 'Netlify', 'Docker', 'Kubernetes',
  'Tailwind CSS', 'Material-UI', 'Chakra UI',
  'Prisma', 'Drizzle', 'tRPC', 'GraphQL', 'REST API'
];

export default function ProjectForm({ 
  project, 
  clients, 
  users, 
  isOpen, 
  onClose, 
  onSubmit 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    clientId: '',
    domain: '',
    repository: '',
    startDate: '',
    endDate: '',
    budget: undefined,
    hourlyRate: undefined,
    technology: [],
    apiBaseUrl: '',
    dbConnectionString: '',
    dbType: '',
    assignedToId: '',
    status: 'PLANNING',
    apiEndpoints: []
  });
  const [newTech, setNewTech] = useState('');
  const [newEndpoint, setNewEndpoint] = useState<ApiEndpoint>({
    name: '',
    method: 'GET',
    path: '',
    description: '',
    requiresAuth: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        domain: project.domain || '',
        repository: project.repository || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || undefined,
        hourlyRate: project.hourlyRate || undefined,
        technology: project.technology || [],
        apiBaseUrl: project.apiBaseUrl || '',
        dbConnectionString: project.dbConnectionString || '',
        dbType: project.dbType || '',
        assignedToId: project.assignedToId || '',
        status: project.status || 'PLANNING',
        apiEndpoints: project.apiEndpoints || []
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    if (newTech && !formData.technology.includes(newTech)) {
      setFormData(prev => ({
        ...prev,
        technology: [...prev.technology, newTech]
      }));
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technology: prev.technology.filter(t => t !== tech)
    }));
  };

  const addEndpoint = () => {
    if (newEndpoint.name && newEndpoint.path) {
      setFormData(prev => ({
        ...prev,
        apiEndpoints: [...(prev.apiEndpoints || []), newEndpoint]
      }));
      setNewEndpoint({
        name: '',
        method: 'GET',
        path: '',
        description: '',
        requiresAuth: false
      });
    }
  };

  const removeEndpoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      apiEndpoints: prev.apiEndpoints?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">Client *</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.company && `(${client.company})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Select
                      value={formData.assignedToId}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, assignedToId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select developer" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="repository">Repository URL</Label>
                    <Input
                      id="repository"
                      value={formData.repository}
                      onChange={(e) => setFormData(prev => ({ ...prev, repository: e.target.value }))}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={newTech} onValueChange={setNewTech}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select or type technology" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TECHNOLOGIES.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Or type custom..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTechnology}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.technology.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API & Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  API & Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiBaseUrl">API Base URL</Label>
                  <Input
                    id="apiBaseUrl"
                    value={formData.apiBaseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiBaseUrl: e.target.value }))}
                    placeholder="https://api.example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dbType">Database Type</Label>
                    <Select
                      value={formData.dbType}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, dbType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dbConnectionString">Database Connection String</Label>
                    <Input
                      id="dbConnectionString"
                      type="password"
                      value={formData.dbConnectionString}
                      onChange={(e) => setFormData(prev => ({ ...prev, dbConnectionString: e.target.value }))}
                      placeholder="postgres://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new endpoint */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={newEndpoint.name}
                      onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Endpoint name"
                    />
                    <Select
                      value={newEndpoint.method}
                      onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') => setNewEndpoint(prev => ({ ...prev, method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newEndpoint.path}
                      onChange={(e) => setNewEndpoint(prev => ({ ...prev, path: e.target.value }))}
                      placeholder="/api/endpoint"
                    />
                  </div>
                  <Input
                    value={newEndpoint.description}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newEndpoint.requiresAuth}
                        onCheckedChange={(checked: boolean) => setNewEndpoint(prev => ({ ...prev, requiresAuth: checked }))}
                      />
                      <Label>Requires Authentication</Label>
                    </div>
                    <Button type="button" onClick={addEndpoint} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Endpoint
                    </Button>
                  </div>
                </div>

                {/* Existing endpoints */}
                {formData.apiEndpoints && formData.apiEndpoints.length > 0 && (
                  <div className="space-y-2">
                    {formData.apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                            <span className="font-medium">{endpoint.name}</span>
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                            {endpoint.requiresAuth && (
                              <Badge variant="outline" className="text-xs">
                                <Key className="h-3 w-3 mr-1" />
                                Auth
                              </Badge>
                            )}
                          </div>
                          {endpoint.description && (
                            <p className="text-sm text-slate-600 mt-1">{endpoint.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEndpoint(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
