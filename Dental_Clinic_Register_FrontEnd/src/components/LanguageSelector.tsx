import { Box, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import Flag from 'react-world-flags';

function LanguageSelector() {
  const [lang, setLang] = useState('en');

  return (
    <Select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      size="small"
      sx={{
        minWidth: 120,
        color: 'white',
        '.MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '.MuiSvgIcon-root': {
          color: 'white',
        },
      }}
    >
      <MenuItem value="en">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="GB" style={{ width: 20 }} /> English
        </Box>
      </MenuItem>
      <MenuItem value="ro">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="RO" style={{ width: 20 }} /> Română
        </Box>
      </MenuItem>
      <MenuItem value="hu">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag code="HU" style={{ width: 20 }} /> Magyar
        </Box>
      </MenuItem>
    </Select>
  );
}

export default LanguageSelector;
