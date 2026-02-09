# Enhanced Address Parser for Philippine National IDs
# Add this to app.py after the existing _parse_address_components method

def _parse_philippine_national_id_address(self, address_text):
    """
    Enhanced parser specifically for Philippine National ID format
    Example: "BLK 40 LOT 3 NORTHVILLE 2B BAGUMBONG, BARANGAY 171, CITY OF CALOOCAN, NCR, THIRD DISTRICT, PHILIPPINES, 1421"
    """
    upper_addr = address_text.upper()
    
    # Extract Block Number
    block_match = re.search(r'BLK\.?\s*(\d+)', upper_addr)
    if block_match:
        self.fields['block_number'] = f"Block {block_match.group(1)}"
        self.confidence['block_number'] = 0.95
        print(f"[PHIL-ID] Block: {block_match.group(1)}")
    
    # Extract Lot Number
    lot_match = re.search(r'LOT\.?\s*(\d+)', upper_addr)
    if lot_match:
        self.fields['lot_number'] = f"Lot {lot_match.group(1)}"
        self.confidence['lot_number'] = 0.95
        print(f"[PHIL-ID] Lot: {lot_match.group(1)}")
    
    # Extract Subdivision/Area Name (between LOT and BARANGAY/comma)
    # Pattern: "LOT 3 NORTHVILLE 2B BAGUMBONG," → extract "NORTHVILLE 2B"
    subdiv_pattern = r'LOT\s+\d+\s+([A-Z0-9\s]+?)(?:\s+(?:BAGUMBONG|BARANGAY)|,)'
    subdiv_match = re.search(subdiv_pattern, upper_addr)
    if subdiv_match:
        subdivision = subdiv_match.group(1).strip()
        # Remove "BAGUMBONG" if it got captured
        subdivision = subdivision.replace('BAGUMBONG', '').strip()
        if subdivision and len(subdivision) > 2:
            self.fields['subdivision'] = subdivision.title()
            self.confidence['subdivision'] = 0.85
            print(f"[PHIL-ID] Subdivision: {subdivision}")
    
    # Extract ZIP Code (last 4-digit number)
    zip_matches = re.findall(r'\b(\d{4})\b', upper_addr)
    if zip_matches:
        # Take the last one (usually at the end)
        zip_code = zip_matches[-1]
        if 1000 <= int(zip_code) <= 9999:
            self.fields['zip_code'] = zip_code
            self.confidence['zip_code'] = 0.95
            print(f"[PHIL-ID] ZIP: {zip_code}")
