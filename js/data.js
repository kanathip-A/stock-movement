// รายการสินค้าที่นับ — แก้ไขไฟล์นี้เพื่อเพิ่ม/ลดสินค้า
// sys = ยอดยกมาตั้งต้น (หน่วยย่อย), bigSize = จำนวนหน่วยย่อยใน 1 หน่วยใหญ่
// rate = อัตราการใช้ปกติ (หน่วยย่อย) ต่อยอดขาย 1,000 บาท
export const ITEMS = [
  { shelf: 'dry', code: 'RM00051', name: 'ข้าวสารญี่ปุ่น 5KG. 5pk/sac', sys: 9, bigUnit: 'กระสอบ', bigSize: 5, smallUnit: 'ถุง', rate: 0.42 },
  { shelf: 'dry', code: 'RM00065', name: 'น้ำส้มปรุงสำเร็จ 5L. (น้ำปรุงซูชิ)', sys: 13, bigUnit: 'ลัง', bigSize: 6, smallUnit: 'แกลลอน', rate: 0.55 },
  { shelf: 'cold', code: 'SM00005', name: 'เนื้อปลาแซลมอน', sys: 17, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'ชิ้น', rate: 1.80 },
  { shelf: 'cold', code: 'SM00020', name: 'เนื้อวากิวสไลด์ 500g. (ซูชิ)', sys: 20, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 0.95 },
  { shelf: 'cold', code: 'RM00013', name: 'เบคอนรมควัน 1KG. 5pk/bag', sys: 23, bigUnit: 'ถุง', bigSize: 5, smallUnit: 'แพค', rate: 1.10 },
  { shelf: 'cold', code: 'RM00018', name: 'ไข่กุ้งส้ม 500g.', sys: 20, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 0.80 },
  { shelf: 'cold', code: 'RM00031', name: 'ทูน่า', sys: 17, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'ชิ้น', rate: 1.35 },
  { shelf: 'cold', code: 'RM00040', name: 'ไข่ไก่ เบอร์ 4 (30 ฟอง/แพค)', sys: 30, bigUnit: 'แพค', bigSize: 30, smallUnit: 'ฟอง', rate: 6.40 },
  { shelf: 'cold', code: 'RM00105', name: 'ปลาซาบะดองแล่ 500 กรัม/แพค', sys: 20, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 0.90 },
  { shelf: 'cold', code: 'RM00115', name: 'กุ้ง Hiraki Argen 4L 20ชิ้น/แพค (18แพค/ลัง)', sys: 36, bigUnit: 'ลัง', bigSize: 18, smallUnit: 'แพค', rate: 1.60 },
  { shelf: 'cold', code: 'RM00177', name: 'กุ้งอาเจนตินา L2 42-60 PCS/PACK', sys: 40, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 1.90 },
  { shelf: 'cold', code: 'RM00181', name: 'ไข่ปลาแซลมอน Pink 500 กรัม', sys: 20, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 0.75 },
  { shelf: 'cold', code: 'RM00308', name: 'แซลมอนสเต๊ก 5 ชิ้น/แพค', sys: 45, bigUnit: 'ลัง', bigSize: 12, smallUnit: 'แพค', rate: 2.10 },
  { shelf: 'cold', code: 'RM00346', name: 'หมูทงคัตสึ 100g. (50ชิ้น/ลัง)', sys: 48, bigUnit: 'ลัง', bigSize: 50, smallUnit: 'ชิ้น', rate: 4.80 },
  { shelf: 'cold', code: 'RM00448', name: 'หอยเชลล์ Hotate 6S 1KG. (81-100pcs/pack)', sys: 23, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 1.05 },
  { shelf: 'buffet', code: 'RM00139', name: 'กุ้งต้มแช่แข็ง 51/60 (บุฟเฟ่ต์)', sys: 40, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 2.40 },
  { shelf: 'buffet', code: 'RM00457', name: 'กุ้งปอกเปลือก PPV 31/40 (เฉพาะ Buffet) 1kg/pack', sys: 56, bigUnit: 'ลัง', bigSize: 10, smallUnit: 'แพค', rate: 3.20 },
];

export const SHELVES = [
  { id: 'dry', name: 'ของแห้ง', icon: 'shelf-dry' },
  { id: 'cold', name: 'ของเย็น', icon: 'shelf-cold' },
  { id: 'buffet', name: 'บุฟเฟ่ต์', icon: 'shelf-cold' },
];

export const BRANCHES = ['ACP', 'ZR', 'TU', 'FPR', 'BU', 'MVR', 'CAY', 'SMA', 'YCR'];

// เกณฑ์เตือนในแท็บวิเคราะห์ (% ที่เบี่ยงจากอัตราปกติ)
export const THRESHOLD = 10;
