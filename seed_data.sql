
-- ============================================================
-- 23. GUIDANCE PROCESSES
-- ============================================================
INSERT INTO guidance_processes (thesis_round_id, week_number, phase_name, work_description, expected_outcome) VALUES
(1, 1,  'Kickoff & Xác d?nh d? tài',    'G?p g? GVHD, xác d?nh ph?m vi d? tài, l?p k? ho?ch t?ng th?', 'K? ho?ch th?c hi?n du?c phê duy?t'),
(1, 2,  'Nghiên c?u tài li?u',          'Tìm hi?u công ngh?, d?c tài li?u liên quan, phân tích h? th?ng tuong t?', 'Báo cáo nghiên c?u t?ng quan'),
(1, 3,  'Phân tích yêu c?u',            'Thu th?p và phân tích yêu c?u ch?c nang và phi ch?c nang', 'Tài li?u SRS hoàn ch?nh'),
(1, 4,  'Thi?t k? h? th?ng',            'Thi?t k? ki?n trúc, database, API', 'Tài li?u thi?t k? h? th?ng'),
(1, 5,  'Thi?t k? chi ti?t',            'Thi?t k? UI/UX, flow ngu?i dùng, wireframe', 'Mockup và prototype'),
(1, 6,  'Cài d?t Sprint 1',             'Phát tri?n các module c?t lõi', 'Demo Sprint 1'),
(1, 7,  'Cài d?t Sprint 2',             'Phát tri?n các tính nang chính', 'Demo Sprint 2'),
(1, 8,  'Cài d?t Sprint 3',             'Hoàn thi?n các tính nang', 'Demo Sprint 3'),
(1, 9,  'Ki?m th?',                     'Unit test, Integration test, UAT', 'Báo cáo ki?m th?'),
(1, 10, 'S?a l?i & T?i uu',            'Fix bug, t?i uu hi?u nang', 'H? th?ng ?n d?nh'),
(1, 11, 'Hoàn thi?n tài li?u',          'Vi?t báo cáo, tài li?u k? thu?t', 'Báo cáo nháp'),
(1, 12, 'Review và ch?nh s?a',          'GVHD review, ch?nh s?a theo góp ý', 'Báo cáo hoàn ch?nh'),
(1, 13, 'Chu?n b? ph?n bi?n',          'Chu?n b? tài li?u n?p ph?n bi?n', 'H? so n?p ph?n bi?n'),
(1, 14, 'Chu?n b? b?o v?',             'Chu?n b? slide, luy?n thuy?t trình', 'Slide trình bày'),
(1, 15, 'B?o v?',                       'B?o v? tru?c h?i d?ng', 'K?t qu? b?o v?');

-- ============================================================
-- 24. WEEKLY REPORTS
-- ============================================================
INSERT INTO weekly_reports (
    thesis_id, week_number, report_date, work_completed, results_achieved,
    difficulties_encountered, next_week_plan, submitted_by,
    student_status, instructor_status, instructor_feedback, weekly_score
) VALUES
(1, 1, '2024-10-01', 'G?p GVHD, xác d?nh ph?m vi, l?p k? ho?ch t?ng th?', 'K? ho?ch du?c phê duy?t', NULL, 'Nghiên c?u tài li?u', 1, 'SUBMITTED', 'APPROVED', 'Nhóm kh?i d?u t?t, k? ho?ch rõ ràng.', 8.5),
(1, 2, '2024-10-08', 'Nghiên c?u Moodle, Canvas, Google Classroom; so sánh ki?n trúc', 'Báo cáo t?ng quan 15 trang', 'Tài li?u quá nhi?u, khó l?c thông tin quan tr?ng', 'Phân tích yêu c?u', 1, 'SUBMITTED', 'APPROVED', 'Báo cáo nghiên c?u t?t, c?n t?p trung vào tính nang c?t lõi.', 8.0),
(1, 3, '2024-10-15', 'Thu th?p yêu c?u qua ph?ng v?n gi?ng viên và sinh viên, vi?t SRS', 'SRS v1.0 hoàn ch?nh', NULL, 'Thi?t k? ki?n trúc và database', 1, 'SUBMITTED', 'APPROVED', 'SRS chi ti?t, use case d?y d?. C?n b? sung non-functional requirements.', 8.5),
(1, 4, '2024-10-22', 'Thi?t k? ERD, ki?n trúc microservices, API contract', 'ERD 25 b?ng, ki?n trúc h? th?ng', 'Chua quen v?i microservices pattern', 'Thi?t k? UI, b?t d?u code', 1, 'SUBMITTED', 'APPROVED', 'Thi?t k? t?t. Microservices hoi ph?c t?p cho scope d? án, cân nh?c monolith tru?c.', 7.5),
(2, 1, '2024-10-01', 'Nghiên c?u Rasa framework, tìm dataset tuy?n sinh', 'Setup môi tru?ng Rasa, tìm du?c dataset', NULL, 'Xây d?ng intents và stories co b?n', 5, 'SUBMITTED', 'APPROVED', 'B?t d?u t?t, ch?n dúng framework phù h?p.', 8.0),
(2, 2, '2024-10-08', 'Xây d?ng 30 intents, 200 training examples, train model l?n 1', 'Model d?t accuracy 78% trên test set', 'Thi?u d? li?u m?t s? intent hi?m', 'Thu th?p thêm d? li?u, c?i thi?n model', 5, 'SUBMITTED', 'APPROVED', 'Ti?n d? t?t. C?n tang d? li?u cho các intent th?p.', 8.5),
(2, 3, '2024-10-15', 'Thu th?p thêm 300 câu h?i, train l?i model, b?t d?u xây d?ng API', 'Model d?t 85%, API endpoint co b?n', NULL, 'Xây d?ng frontend và tích h?p', 5, 'SUBMITTED', 'APPROVED', 'C?i thi?n rõ r?t. T?p trung vào edge cases.', 9.0),
(5, 1, '2024-10-01', 'Download FER2013 dataset, ti?n x? lý d? li?u, setup môi tru?ng', 'Dataset 35k ?nh dã x? lý, môi tru?ng s?n sàng', 'GPU h?n ch?, train ch?m', 'Xây d?ng mô hình CNN baseline', 7, 'SUBMITTED', 'APPROVED', 'Kh?i d?u t?t. S? d?ng Google Colab d? có GPU mi?n phí.', 8.0),
(5, 2, '2024-10-08', 'Xây d?ng CNN baseline, train 20 epochs, d?t 62% accuracy', 'Model baseline ho?t d?ng', 'Overfitting ? epoch cao', 'Transfer learning v?i VGG16/ResNet', 7, 'SUBMITTED', 'APPROVED', 'K?t qu? baseline t?t. Th? transfer learning s? c?i thi?n dáng k?.', 8.5);

-- ============================================================
-- 25. WEEKLY REPORT INDIVIDUAL CONTRIBUTIONS
-- ============================================================
INSERT INTO weekly_report_individual_contributions (weekly_report_id, student_id, individual_work, hours_spent) VALUES
(1, 1, 'Ch? trì cu?c h?p kickoff, phân công công vi?c, t?o repo và project management board', 8.0),
(1, 2, 'Nghiên c?u các LMS hi?n có, dánh giá uu nhu?c di?m', 6.0),
(1, 3, 'Setup môi tru?ng dev, c?u hình Docker Compose ban d?u', 5.0),
(2, 1, 'Nghiên c?u ki?n trúc Moodle, vi?t báo cáo ph?n ki?n trúc', 10.0),
(2, 2, 'Nghiên c?u Google Classroom UX, phân tích tính nang', 8.0),
(2, 3, 'Tìm hi?u WebRTC cho video streaming', 7.0);
