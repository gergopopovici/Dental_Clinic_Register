import { Box, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const [lang, setLang] = useState(() => localStorage.getItem('applanguage') || 'en');

  const handleChange = (e: { target: { value: string } }) => {
    const newLanguage = e.target.value;
    setLang(newLanguage);
    setTimeout(() => {
      i18n.changeLanguage(newLanguage);
    }, 50);
    localStorage.setItem('applanguage', newLanguage);
  };

  return (
    <Select
      value={lang}
      onChange={handleChange}
      size="small"
      sx={{
        minWidth: 120,
      }}
    >
      <MenuItem value="en">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="GB" style={{ width: 20 }} /> English
        </Box>
      </MenuItem>
      <MenuItem value="hu">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="HU" style={{ width: 20 }} /> Magyar
        </Box>
      </MenuItem>
      <MenuItem value="ro">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="RO" style={{ width: 20 }} /> Română
        </Box>
      </MenuItem>
    </Select>
  );
}

export default LanguageSelector;
