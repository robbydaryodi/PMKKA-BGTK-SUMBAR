import zipfile
import xml.etree.ElementTree as ET
import json

def clean_npsn(val):
    if not val:
        return ""
    val_str = str(val).strip()
    if 'E' in val_str or 'e' in val_str:
        try:
            val_str = str(int(float(val_str)))
        except:
            pass
    if val_str.endswith('.0'):
        val_str = val_str[:-2]
    return val_str

def parse_xlsx():
    with zipfile.ZipFile('Data Status Sekolah Model.xlsx', 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter():
                if elem.tag.endswith('t') and elem.text:
                    shared_strings.append(elem.text)

        sheet1_xml = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        
        # Get headers from Row 1
        headers = {}
        for row in sheet1_xml.iter():
            if row.tag.endswith('row'):
                r_num = int(row.attrib.get('r'))
                if r_num == 1:
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
                            headers[col_letter] = val

        schools = {}
        for row in sheet1_xml.iter():
            if row.tag.endswith('row'):
                r_num = int(row.attrib.get('r'))
                if r_num >= 2:
                    row_dict = {}
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
                            if val is not None:
                                if cell_type == 's':
                                    idx = int(val)
                                    val = shared_strings[idx] if idx < len(shared_strings) else val
                            row_dict[col_letter] = val

                    raw_npsn = row_dict.get('C')
                    nama_sekolah = row_dict.get('D')
                    if not nama_sekolah:
                        continue
                    
                    npsn = clean_npsn(raw_npsn)
                    
                    pm_sub = {}
                    pm_agg = {}
                    kka_sub = {}
                    kka_agg = {}

                    for col_let, h_name in headers.items():
                        if not h_name:
                            continue
                        val = row_dict.get(col_let, '-')
                        if val is None or val == 'None':
                            val = '-'

                        if h_name.endswith('_PM'):
                            key = h_name[:-3]
                            if key in ['murid', 'guru', 'kepsek', 'Skor PM', 'Kategori Sekolah']:
                                pm_agg[key] = val
                            else:
                                safe_key = key.replace('.', '_')
                                pm_sub[safe_key] = val
                        elif h_name.endswith('_KKA'):
                            key = h_name[:-4]
                            if key in ['Guru', 'KepSek', 'Skor KKA', 'Kategori Sekolah']:
                                kka_agg[key] = val
                            else:
                                safe_key = key.replace('.', '_')
                                kka_sub[safe_key] = val

                    pm_skor_val = pm_agg.get('Skor PM', '-')
                    try:
                        pm_skor_float = round(float(pm_skor_val), 2)
                    except:
                        pm_skor_float = pm_skor_val

                    kka_skor_val = kka_agg.get('Skor KKA', '-')
                    try:
                        kka_skor_float = round(float(kka_skor_val), 2)
                    except:
                        kka_skor_float = kka_skor_val

                    school_obj = {
                        "npsn": npsn,
                        "nama_sekolah": nama_sekolah,
                        "jenjang": row_dict.get('B', '-'),
                        "wilayah_upt": row_dict.get('E', 'BGTK Sumatera Barat'),
                        "provinsi": row_dict.get('F', 'Sumatera Barat'),
                        "kab_kota": row_dict.get('G', '-'),
                        "status_sekolah": row_dict.get('H', '-'),
                        "status_pelaksana_kka": row_dict.get('I', '-'),
                        "jumlah_guru": row_dict.get('J', '-'),
                        "status_pemilihan": row_dict.get('K', '-'),

                        "pm": {
                            "skor": pm_skor_float,
                            "kategori": pm_agg.get('Kategori Sekolah', '-'),
                            "murid": pm_agg.get('murid', '-'),
                            "guru": pm_agg.get('guru', '-'),
                            "kepsek": pm_agg.get('kepsek', '-'),
                            "sub_indikator": pm_sub
                        },

                        "kka": {
                            "skor": kka_skor_float,
                            "kategori": kka_agg.get('Kategori Sekolah', '-'),
                            "guru": kka_agg.get('Guru', '-'),
                            "kepsek": kka_agg.get('KepSek', '-'),
                            "sub_indikator": kka_sub
                        }
                    }

                    schools[npsn] = school_obj

        print(f"Total processed schools: {len(schools)}")
        with open('data_status_sekolah_model.json', 'w', encoding='utf-8') as f:
            json.dump(schools, f, ensure_ascii=False, indent=2)
        print("Saved data_status_sekolah_model.json successfully!")

if __name__ == '__main__':
    parse_xlsx()
