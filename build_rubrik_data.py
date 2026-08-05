import zipfile
import xml.etree.ElementTree as ET
import json

def parse_rubrik():
    with zipfile.ZipFile('Data Status Sekolah Model.xlsx', 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter():
                if elem.tag.endswith('t') and elem.text:
                    shared_strings.append(elem.text)

        rubrik_pm = []
        curr_dom_pm = ""
        curr_sub_pm = ""

        sheet2_xml = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
        for row in sheet2_xml.iter():
            if row.tag.endswith('row'):
                r_num = int(row.attrib.get('r'))
                if r_num == 1: continue
                row_cells = {}
                for c in row.iter():
                    if c.tag.endswith('c'):
                        col_ref = c.attrib.get('r')
                        col_letter = ''.join([ch for ch in col_ref if ch.isalpha()])
                        cell_type = c.attrib.get('t')
                        val = None
                        for v in c.iter():
                            if v.tag.endswith('v') and v.text:
                                val = v.text
                                break
                        if val is not None and cell_type == 's':
                            idx = int(val)
                            val = shared_strings[idx] if idx < len(shared_strings) else val
                        row_cells[col_letter] = val
                
                if not any(row_cells.values()): continue

                if row_cells.get('A'): curr_dom_pm = row_cells.get('A').strip()
                if row_cells.get('B'): curr_sub_pm = row_cells.get('B').strip()
                
                kode_sub = row_cells.get('E')
                nama_ind = row_cells.get('D')
                if kode_sub and nama_ind:
                    rubrik_pm.append({
                        "kode": str(kode_sub).strip(),
                        "nama": str(nama_ind).strip(),
                        "domain": curr_dom_pm,
                        "sub_domain": curr_sub_pm,
                        "kode_sub_domain": str(row_cells.get('C') or '').strip()
                    })

        rubrik_kka = []
        curr_dom_kka = ""
        curr_sub_kka = ""

        sheet3_xml = ET.fromstring(z.read('xl/worksheets/sheet3.xml'))
        for row in sheet3_xml.iter():
            if row.tag.endswith('row'):
                r_num = int(row.attrib.get('r'))
                if r_num == 1: continue
                row_cells = {}
                for c in row.iter():
                    if c.tag.endswith('c'):
                        col_ref = c.attrib.get('r')
                        col_letter = ''.join([ch for ch in col_ref if ch.isalpha()])
                        cell_type = c.attrib.get('t')
                        val = None
                        for v in c.iter():
                            if v.tag.endswith('v') and v.text:
                                val = v.text
                                break
                        if val is not None and cell_type == 's':
                            idx = int(val)
                            val = shared_strings[idx] if idx < len(shared_strings) else val
                        row_cells[col_letter] = val
                
                if not any(row_cells.values()): continue

                if row_cells.get('A'): curr_dom_kka = row_cells.get('A').strip()
                if row_cells.get('B'): curr_sub_kka = row_cells.get('B').strip()
                
                kode_sub = row_cells.get('E')
                nama_ind = row_cells.get('D')
                if kode_sub and nama_ind:
                    rubrik_kka.append({
                        "kode": str(kode_sub).strip(),
                        "nama": str(nama_ind).strip(),
                        "domain": curr_dom_kka,
                        "sub_domain": curr_sub_kka,
                        "kode_sub_domain": str(row_cells.get('C') or '').strip()
                    })

        data = {
            "pm": rubrik_pm,
            "kka": rubrik_kka
        }

        with open('data_rubrik_sekolah_model.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Parsed {len(rubrik_pm)} PM rubriks and {len(rubrik_kka)} KKA rubriks successfully!")

if __name__ == '__main__':
    parse_rubrik()
