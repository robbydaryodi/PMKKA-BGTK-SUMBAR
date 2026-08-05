import zipfile
import xml.etree.ElementTree as ET
import sys

def parse_xlsx(filename):
    with zipfile.ZipFile(filename, 'r') as z:
        # Load shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            # namespace handled
            for elem in tree.iter():
                if elem.tag.endswith('t') and elem.text:
                    shared_strings.append(elem.text)

        # Get sheet names
        workbook_xml = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = []
        for elem in workbook_xml.iter():
            if elem.tag.endswith('sheet'):
                sheets.append((elem.attrib.get('name'), elem.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id') or elem.attrib.get('r:id')))

        print("Workbook Sheets:", [s[0] for s in sheets])

        # Parse first sheet
        sheet_files = [f for f in z.namelist() if f.startswith('xl/worksheets/sheet')]
        for sfile in sheet_files:
            print(f"\n================ Sheet File: {sfile} ================")
            sheet_xml = ET.fromstring(z.read(sfile))
            
            rows_data = []
            for row in sheet_xml.iter():
                if row.tag.endswith('row'):
                    row_num = row.attrib.get('r')
                    cells = []
                    for c in row.iter():
                        if c.tag.endswith('c'):
                            col_ref = c.attrib.get('r')
                            cell_type = c.attrib.get('t')
                            val = None
                            for v in c.iter():
                                if v.tag.endswith('v') and v.text:
                                    val = v.text
                                    break
                            if val is not None:
                                if cell_type == 's':
                                    idx = int(val)
                                    val = shared_strings[idx] if idx < len(shared_strings) else val
                            cells.append((col_ref, val))
                    if cells:
                        rows_data.append((row_num, cells))

            print(f"Total Rows parsed: {len(rows_data)}")
            print("First 20 rows:")
            for r_num, cells in rows_data[:20]:
                cell_vals = [f"{col}:{val}" for col, val in cells if val is not None]
                print(f"Row {r_num}: {cell_vals}")

if __name__ == '__main__':
    parse_xlsx('Data Status Sekolah Model.xlsx')
