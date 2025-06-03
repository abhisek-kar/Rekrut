import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Switch } from "@/components/shadcn-ui/switch";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/shadcn-ui/badge";

// Define field types with icons and labels
const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "date", label: "Date Picker" },
  { value: "file", label: "File Upload" },
  { value: "rating", label: "Rating" },
];

const entityTypes = [
  { value: "job", label: "Jobs" },
  { value: "candidate", label: "Candidates" },
  { value: "application", label: "Applications" },
];

// Validation schemas
const optionSchema = z.object({
  value: z.string().min(1, { message: "Option value is required" }),
  label: z.string().min(1, { message: "Option label is required" }),
});

const customFieldSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Field name must be at least 2 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Field name can only contain letters, numbers, and underscores",
    }),
  label: z.string().min(2, { message: "Display label is required" }),
  type: z.string().min(1, { message: "Field type is required" }),
  entity: z.string().min(1, { message: "Entity type is required" }),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(optionSchema).optional(),
  isRequired: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  visibleTo: z
    .array(z.string())
    .min(1, { message: "Select at least one role" }),
  defaultValue: z.string().optional(),
  order: z.number().default(0),
});

type CustomFieldFormValues = z.infer<typeof customFieldSchema>;

export interface CustomField {
  _id: string;
  name: string;
  label: string;
  type: string;
  entity: string;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  validation?: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: string;
  isVisible: boolean;
  visibleTo: string[];
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomFieldsManagerProps {
  fields: CustomField[];
  loading: boolean;
  onAddField: (field: Omit<CustomFieldFormValues, "_id">) => Promise<void>;
  onEditField: (
    id: string,
    field: Partial<CustomFieldFormValues>
  ) => Promise<void>;
  onDeleteField: (id: string) => Promise<void>;
  onReorderField: (id: string, direction: "up" | "down") => Promise<void>;
}

export function CustomFieldsManager({
  fields,
  loading,
  onAddField,
  onEditField,
  onDeleteField,
  onReorderField,
}: CustomFieldsManagerProps) {
  const [selectedEntity, setSelectedEntity] = useState<string>("job");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [currentOptions, setCurrentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  // Filter fields by selected entity
  const filteredFields = fields.filter(
    (field) => field.entity === selectedEntity
  );

  // Form for adding/editing fields
  const form = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "text",
      entity: selectedEntity,
      placeholder: "",
      helpText: "",
      options: [],
      isRequired: false,
      isVisible: true,
      visibleTo: ["admin", "subadmin"],
      defaultValue: "",
      order: 0,
    },
  });

  // Reset form when opening add dialog
  const handleAddClick = () => {
    form.reset({
      name: "",
      label: "",
      type: "text",
      entity: selectedEntity,
      placeholder: "",
      helpText: "",
      options: [],
      isRequired: false,
      isVisible: true,
      visibleTo: ["admin", "subadmin"],
      defaultValue: "",
      order: 0,
    });
    setCurrentOptions([]);
    setIsAddDialogOpen(true);
    setEditingField(null);
  };

  // Set form values when editing a field
  const handleEditClick = (field: CustomField) => {
    form.reset({
      name: field.name,
      label: field.label,
      type: field.type,
      entity: field.entity,
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      options: field.options || [],
      isRequired: field.validation?.required || false,
      isVisible: field.isVisible,
      visibleTo: field.visibleTo,
      defaultValue: field.defaultValue || "",
      order: field.order,
    });
    setCurrentOptions(field.options || []);
    setIsAddDialogOpen(true);
    setEditingField(field);
  };

  // Handle form submission
  const onSubmit = async (data: CustomFieldFormValues) => {
    try {
      // Add options to form data
      const formattedData = {
        ...data,
        options: currentOptions,
        validation: {
          required: data.isRequired,
        },
      };

      if (editingField) {
        await onEditField(editingField._id, formattedData);
      } else {
        await onAddField(formattedData);
      }

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error saving custom field:", error);
    }
  };

  // Handle adding a new option
  const handleAddOption = () => {
    if (newOption.value && newOption.label) {
      setCurrentOptions([...currentOptions, { ...newOption }]);
      setNewOption({ value: "", label: "" });
    }
  };

  // Handle removing an option
  const handleRemoveOption = (index: number) => {
    setCurrentOptions(currentOptions.filter((_, i) => i !== index));
  };

  // Get field type display name
  const getFieldTypeLabel = (type: string) => {
    return fieldTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Create and manage custom fields for different entities in your
            system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {entityTypes.map((entity) => (
                <Button
                  key={entity.value}
                  variant={
                    selectedEntity === entity.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedEntity(entity.value)}
                >
                  {entity.label}
                </Button>
              ))}
            </div>
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Visible To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading custom fields...
                    </TableCell>
                  </TableRow>
                ) : filteredFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No custom fields found for this entity. Click &quot;Add
                      Field&quot; to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFields.map((field) => (
                    <TableRow key={field._id}>
                      <TableCell className="font-medium">
                        {field.label}
                        <div className="text-xs text-muted-foreground">
                          {field.name}
                        </div>
                      </TableCell>
                      <TableCell>{getFieldTypeLabel(field.type)}</TableCell>
                      <TableCell>
                        {field.validation?.required ? (
                          <Badge variant="default">Required</Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {field.visibleTo.includes("admin") && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                          {field.visibleTo.includes("subadmin") && (
                            <Badge variant="secondary" className="text-xs">
                              SubAdmin
                            </Badge>
                          )}
                          {field.isVisible &&
                            field.visibleTo.includes("candidate") && (
                              <Badge variant="secondary" className="text-xs">
                                Candidate
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(field)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReorderField(field._id, "up")}
                              disabled={field.order === 0}
                            >
                              <MoveUp className="mr-2 h-4 w-4" />
                              Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReorderField(field._id, "down")}
                              disabled={
                                field.order === filteredFields.length - 1
                              }
                            >
                              <MoveDown className="mr-2 h-4 w-4" />
                              Move Down
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onEditField(field._id, {
                                  isVisible: !field.isVisible,
                                })
                              }
                              className={
                                field.isVisible
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }
                            >
                              {field.isVisible ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Hide Field
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Show Field
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to delete the field "${field.label}"?`
                                  )
                                ) {
                                  onDeleteField(field._id);
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Field Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Field" : "Add New Field"}
            </DialogTitle>
            <DialogDescription>
              {editingField
                ? "Modify the custom field properties"
                : "Create a new custom field for your forms"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField<CustomFieldFormValues>
                  control={form.control}
                  name="entity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!editingField}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Where this field will be used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type*</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset options if type changes and is not select/multiselect/radio
                          if (
                            ![
                              "select",
                              "multiselect",
                              "radio",
                              "checkbox",
                            ].includes(value)
                          ) {
                            setCurrentOptions([]);
                          }
                        }}
                        defaultValue={field.value}
                        disabled={!!editingField}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the field will be displayed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="field_name"
                          {...field}
                          disabled={!!editingField}
                        />
                      </FormControl>
                      <FormDescription>
                        Internal name (no spaces, snake_case)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Label*</FormLabel>
                      <FormControl>
                        <Input placeholder="Field Label" {...field} />
                      </FormControl>
                      <FormDescription>Shown to users on forms</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Placeholder Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter placeholder text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Helper text shown inside the field before user input
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Help Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter help text for this field"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional information shown beneath the field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Default Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Default value" {...field} />
                      </FormControl>
                      <FormDescription>
                        Pre-populated value for the field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required Field</FormLabel>
                        <FormDescription>
                          User must provide a value
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Visible</FormLabel>
                        <FormDescription>Show field on forms</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="visibleTo"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Visible To</FormLabel>
                      <FormDescription>
                        Select which user roles can see this field
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="visibleTo"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("admin")}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, "admin"]
                                      : field.value?.filter(
                                          (value) => value !== "admin"
                                        );
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Admin
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="visibleTo"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("subadmin")}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, "subadmin"]
                                      : field.value?.filter(
                                          (value) => value !== "subadmin"
                                        );
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                SubAdmin
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="visibleTo"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("candidate")}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, "candidate"]
                                      : field.value?.filter(
                                          (value) => value !== "candidate"
                                        );
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Candidate (Public)
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options section for select, multiselect, radio, and checkbox fields */}
              {["select", "multiselect", "radio", "checkbox"].includes(
                form.watch("type")
              ) && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Field Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Add options for the user to select from
                    </p>
                  </div>

                  {/* Add new option */}
                  <div className="flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Option Value"
                        value={newOption.value}
                        onChange={(e) =>
                          setNewOption({ ...newOption, value: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Display Label"
                        value={newOption.label}
                        onChange={(e) =>
                          setNewOption({ ...newOption, label: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddOption}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  {/* Current options */}
                  {currentOptions.length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Value</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead className="w-[80px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOptions.map((option, index) => (
                            <TableRow key={index}>
                              <TableCell>{option.value}</TableCell>
                              <TableCell>{option.label}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {currentOptions.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No options added. Add at least one option for this field
                      type.
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingField ? "Update Field" : "Create Field"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
