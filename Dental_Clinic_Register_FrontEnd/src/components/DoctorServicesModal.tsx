import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllServices } from "../services/ProvidedServiceService";
import { updateMyServices } from "../services/DoctorService";
import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from "@mui/material";

interface Props{
    open: boolean;
    onClose: () => void;
    currentServiceIds: number[];
}

export default function DoctorServicesModal({open,onClose,currentServiceIds}:Props){
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(()=>{
        if (open){
            setSelectedIds(currentServiceIds);
        }
    },[open,currentServiceIds]);

    const {data: services = [], isLoading} = useQuery({
        queryKey: ['services'],
        queryFn:getAllServices,
        enabled:open,
    });

    const updateMutation = useMutation({
        mutationFn:(ids:number[]) => updateMyServices(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['userDetails']});
            alert(t('success.doctor.services.updated', 'Services updated successfully!'));
            onClose();
        },
        onError: () => alert(t('error.generic','Something went wrong.')),
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('updatedServices') || 'Updated Services'}</DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <CircularProgress sx={{display:'block',margin:'20px auto'}}/>

                ):(
                    <FormControl fullWidth sx={{mt:2}}>
                        <InputLabel id="update-services-label">{t('servicesProvided') || 'Services'}</InputLabel>
                            <Select
                    labelId="update-services-label"
                    multiple
                    value={selectedIds}
                    onChange={(e) => setSelectedIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value as number[])}
                    input={<OutlinedInput label={t('servicesProvided') || 'Services'} />}
                    renderValue={(selected) =>
                        services
                        .filter((service) => selected.includes(service.id))
                        .map((service) => service.name)
                        .join(', ')
                    }
                    >
                    {services.map((service) => (
                        <MenuItem key={service.id} value={service.id}>
                        <Checkbox checked={selectedIds.includes(service.id)} />
                        <ListItemText primary={service.name} secondary={`${service.price} RON`} />
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button
                  variant="contained"
                  onClick={()=>updateMutation.mutate(selectedIds)}
                  disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? <CircularProgress size={24} color='inherit'/> : t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}