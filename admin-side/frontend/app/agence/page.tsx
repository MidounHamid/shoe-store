"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layouts/layout"
import { getAuthToken } from "@/lib/auth"

// Types
interface AgencyData {
  id?: number
  nom_agence: string
  Adresse: string
  ville: string

  telephone:string
  rc: string
  patente: string
  IF: string
  n_cnss?: string
  ICE: string
  n_compte_bancaire?: string
  logo?: File
}

interface FormField {
  name: keyof AgencyData
  label: string
  placeholder: string
  required: boolean
  type?: 'text' | 'file'
  accept?: string
}

// Schema
const formSchema = z.object({
  nom_agence: z.string().min(1, "Agency name is required").max(255, "Agency name must be less than 255 characters"),
  Adresse: z.string().min(1, "Address is required").max(255, "Address must be less than 255 characters"),
  ville: z.string().min(1, "City is required").max(255, "City must be less than 255 characters"),
    telephone: z.string().min(1, "Telephone is required").max(255, "Telephone must be less than 255 characters"),
  rc: z.string().min(1, "RC is required").max(255, "RC must be less than 255 characters"),
  patente: z.string().min(1, "Patent is required").max(255, "Patent must be less than 255 characters"),
  IF: z.string().min(1, "IF is required").max(255, "IF must be less than 255 characters"),
  n_cnss: z.string().max(255, "CNSS number must be less than 255 characters").optional(),
  ICE: z.string().min(1, "ICE is required").max(255, "ICE must be less than 255 characters"),
  n_compte_bancaire: z.string().max(255, "Bank account number must be less than 255 characters").optional(),
})

// Constants
const FORM_FIELDS: FormField[] = [
  { name: 'nom_agence', label: 'Agency Name', placeholder: 'Enter agency name', required: true },
  { name: 'Adresse', label: 'Address', placeholder: 'Enter address', required: true },
  { name: 'ville', label: 'City', placeholder: 'Enter city', required: true },
  { name: 'telephone', label: 'Telephone', placeholder: 'Enter telephone', required: true },
  { name: 'rc', label: 'RC', placeholder: 'Enter RC', required: true },
  { name: 'patente', label: 'Patent', placeholder: 'Enter patent', required: true },
  { name: 'IF', label: 'IF', placeholder: 'Enter IF', required: true },
  { name: 'n_cnss', label: 'CNSS Number', placeholder: 'Enter CNSS number (optional)', required: false },
  { name: 'ICE', label: 'ICE', placeholder: 'Enter ICE', required: true },
  { name: 'n_compte_bancaire', label: 'Bank Account Number', placeholder: 'Enter bank account number (optional)', required: false },
]

const DEFAULT_VALUES: Partial<AgencyData> = {
  nom_agence: "",
  Adresse: "",
  ville: "",
  telephone: "",
  rc: "",
  patente: "",
  IF: "",
  n_cnss: "",
  ICE: "",
  n_compte_bancaire: "",
}

// Custom hooks
const useAgencyData = () => {
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)

  const fetchAgencyData = useCallback(async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agences/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json();
        console.log("data => ", data[0]);
        if (data[0]) {
          const agencyInfo = data[0]
          setAgencyData(agencyInfo)
          setIsEditing(true)
          setFieldsDisabled(true)
          return agencyInfo
        }
      } else if (response.status === 404) {
        setIsEditing(false)
        setFieldsDisabled(false)
      }
    } catch (error) {
      console.error('Error fetching agency data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch agency data",
        variant: "destructive",
      })
    }
    return null
  }, [])

  return {
    agencyData,
    isEditing,
    fieldsDisabled,
    setFieldsDisabled,
    fetchAgencyData,
  }
}

const useAgencyForm = (agencyData: AgencyData | null, fieldsDisabled: boolean, setFieldsDisabled: (disabled: boolean) => void) => {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add _method for Laravel to handle PUT request
      if (agencyData?.id) {
        formData.append('_method', 'PUT')
      }

      const token = getAuthToken()
      const url = agencyData?.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/agences/${agencyData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/agences`

      const method = agencyData?.id ? "POST" : "POST" // Always use POST, Laravel will handle PUT via _method

      // // Debug logs
      // console.log('Current agencyId:', agencyData?.id)
      // console.log('Request URL:', url)
      // console.log('Request Method:', method)
      // console.log('Form Values:', values)
      // console.log('FormData entries:')
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1])
      // }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      })

      const responseData = await response.json()
      console.log('Response Data:', responseData)

      if (response.ok) {
        toast({
          title: "Success",
          description: responseData.message || "Agency updated successfully",
          variant: "default",
        })

        if (!agencyData?.id) {
          setFieldsDisabled(true)
        } else {
          setFieldsDisabled(true)
          // Refresh the form data after update
          if (responseData.agence) {
            console.log('Updating form with new data:', responseData.agence)
            form.reset({
              nom_agence: responseData.agence.nom_agence || "",
              Adresse: responseData.agence.Adresse || "",
              ville: responseData.agence.ville || "",
                telephone: responseData.agence.telephone || "",
              rc: responseData.agence.rc || "",
              patente: responseData.agence.patente || "",
              IF: responseData.agence.IF || "",
              n_cnss: responseData.agence.n_cnss || "",
              ICE: responseData.agence.ICE || "",
              n_compte_bancaire: responseData.agence.n_compte_bancaire || "",
            })
          }
        }
      } else {
        throw new Error(responseData.message || `Failed to ${agencyData?.id ? 'update' : 'create'} agency`)
      }
    } catch (error) {
      console.error('Error saving agency data:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save agency data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [agencyData, setFieldsDisabled, form])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
    }
  }, [])

  const handleEditToggle = useCallback(() => {
    setFieldsDisabled(!fieldsDisabled)
  }, [fieldsDisabled, setFieldsDisabled])

  return {
    form,
    isLoading,
    fileInputRef,
    handleSubmit,
    handleFileChange,
    handleEditToggle,
  }
}

// Components
const FormFieldComponent: React.FC<{
  field: FormField
  form: UseFormReturn<z.infer<typeof formSchema>>
  disabled: boolean
}> = ({ field, form, disabled }) => (
  <FormField
    control={form.control}
    name={field.name as keyof z.infer<typeof formSchema>}
    render={({ field: formField }) => (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <FormControl>
          <Input
            placeholder={field.placeholder}
            disabled={disabled}
            {...formField}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

// const LogoField: React.FC<{
//   form: any
//   disabled: boolean
//   onFileChange: (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => void
// }> = ({ form, disabled, onFileChange }) => (
//   <FormField
//     control={form.control}
//     name="logo"
//     render={({ field: { onChange, value, ...rest } }) => (
//       <FormItem>
//         <FormLabel>Logo</FormLabel>
//         <FormControl>
//           <Input
//             type="file"
//             accept="image/*"
//             disabled={disabled}
//             onChange={(e) => onFileChange(e, onChange)}
//             {...rest}
//           />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// )

// Main Component
export default function AgencyForm() {
  const { agencyData, isEditing, fieldsDisabled, setFieldsDisabled, fetchAgencyData } = useAgencyData()
  const { form, isLoading, handleSubmit, handleEditToggle } = useAgencyForm(
    agencyData,
    fieldsDisabled,
    setFieldsDisabled
  )

  useEffect(() => {
    fetchAgencyData().then((data) => {
      if (data) {
        form.reset({
          nom_agence: data.nom_agence || "",
          Adresse: data.Adresse || "",
          ville: data.ville || "",
          telephone: data.telephone || "", 
          rc: data.rc || "",
          patente: data.patente || "",
          IF: data.IF || "",
          n_cnss: data.n_cnss || "",
          ICE: data.ICE || "",
          n_compte_bancaire: data.n_compte_bancaire || "",
        })
      }
    })
  }, [fetchAgencyData, form])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agency Information</h1>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {fieldsDisabled ? "Enable Edit" : "Cancel Edit"}
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FORM_FIELDS.map((field) => (
                <FormFieldComponent
                  key={field.name}
                  field={field}
                  form={form}
                  disabled={fieldsDisabled}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading || fieldsDisabled}
            >
              {isLoading ? "Saving..." : isEditing ? "Update Agency" : "Create Agency"}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  )
}