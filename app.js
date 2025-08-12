class AttendanceApp {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students') || '[]');
        this.attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
        this.currentDate = new Date().toISOString().split('T')[0];
        
        this.initializeApp();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeApp() {
        // Set current date
        document.getElementById('current-date').textContent = 
            new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Set default date range for reports
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('date-from').value = firstDay.toISOString().split('T')[0];
        document.getElementById('date-to').value = today.toISOString().split('T')[0];

        // Add some sample data if empty
        if (this.students.length === 0) {
            this.addSampleData();
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Student code input
        const studentCodeInput = document.getElementById('student-code');
        studentCodeInput.addEventListener('input', (e) => {
            this.showStudentNamePreview(e.target.value.trim());
        });
        studentCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.markAttendance(e.target.value.trim());
            }
        });

        // Scan button
        document.getElementById('scan-btn').addEventListener('click', () => {
            const code = document.getElementById('student-code').value.trim();
            if (code) {
                this.markAttendance(code);
            }
        });

        // Mark all absent
        document.getElementById('mark-all-absent').addEventListener('click', () => {
            this.markAllAbsent();
        });

        // Export daily report
        document.getElementById('export-daily').addEventListener('click', () => {
            this.exportDailyReport();
        });

        // Add student button
        document.getElementById('add-student-btn').addEventListener('click', () => {
            this.showAddStudentModal();
        });

        // Import students button
        document.getElementById('import-students-btn').addEventListener('click', () => {
            this.importStudents();
        });

        // Manual entry button
        document.getElementById('manual-entry-btn').addEventListener('click', () => {
            this.showManualEntryModal();
        });

        // Search students
        document.getElementById('search-students').addEventListener('input', (e) => {
            this.searchStudents(e.target.value);
        });

        // Modal events
        this.setupModalEvents();
        this.setupManualEntryEvents();

        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });
    }

    setupModalEvents() {
        const modal = document.getElementById('add-student-modal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-add');
        const confirmBtn = document.getElementById('confirm-add');
        const generateCodeBtn = document.getElementById('generate-code');

        closeBtn.addEventListener('click', () => this.hideAddStudentModal());
        cancelBtn.addEventListener('click', () => this.hideAddStudentModal());
        confirmBtn.addEventListener('click', () => this.addStudent());
        generateCodeBtn.addEventListener('click', () => this.generateStudentCode());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddStudentModal();
            }
        });

        // Enter key handling in modal
        modal.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addStudent();
                }
            });
        });
    }

    setupManualEntryEvents() {
        const modal = document.getElementById('manual-entry-modal');
        const closeBtn = modal.querySelector('.manual-close');
        const cancelBtn = document.getElementById('cancel-manual-entry');
        const saveBtn = document.getElementById('save-manual-entries');
        const addRowBtn = document.getElementById('add-row');
        const clearTableBtn = document.getElementById('clear-table');
        const autoGenerateBtn = document.getElementById('auto-generate-codes');
        
        // Add bulk input event listeners
        const parseBulkBtn = document.getElementById('parse-bulk-input');
        const clearBulkBtn = document.getElementById('clear-bulk-input');

        closeBtn.addEventListener('click', () => this.hideManualEntryModal());
        cancelBtn.addEventListener('click', () => this.hideManualEntryModal());
        saveBtn.addEventListener('click', () => this.saveManualEntries());
        addRowBtn.addEventListener('click', () => this.addTableRow());
        clearTableBtn.addEventListener('click', () => this.clearEntryTable());
        autoGenerateBtn.addEventListener('click', () => this.autoGenerateCodes());
        
        // New bulk input event listeners
        parseBulkBtn.addEventListener('click', () => this.parseBulkInput());
        clearBulkBtn.addEventListener('click', () => this.clearBulkInput());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideManualEntryModal();
            }
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update display for active tab
        if (tabName === 'students') {
            this.displayStudents();
        } else if (tabName === 'reports') {
            this.updateReportDisplay();
        } else if (tabName === 'attendance') {
            this.updateAttendanceDisplay();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    showStudentNamePreview(code) {
        const previewEl = document.getElementById('student-name-preview');
        if (!code) {
            previewEl.classList.remove('show');
            return;
        }

        const student = this.students.find(s => s.code === code);

        if (student) {
            previewEl.textContent = student.name;
            previewEl.classList.add('show');
        } else {
            previewEl.classList.remove('show');
        }
    }

    markAttendance(code) {
        if (!code) {
            this.showNotification('يرجى إدخال كود الطالب', 'warning');
            return;
        }

        const student = this.students.find(s => s.code === code);
        const previewEl = document.getElementById('student-name-preview');

        if (!student) {
            this.showNotification('كود الطالب غير موجود', 'error');
            document.getElementById('student-code').value = '';
            previewEl.classList.remove('show');
            return;
        }

        // Initialize attendance for current date if not exists
        if (!this.attendance[this.currentDate]) {
            this.attendance[this.currentDate] = {};
        }

        // Check if already marked present
        if (this.attendance[this.currentDate][student.id] === 'present') {
            this.showNotification(`${student.name} مسجل حضوره مسبقاً`, 'warning');
            document.getElementById('student-code').value = '';
            previewEl.classList.remove('show');
            return;
        }

        // Mark as present
        this.attendance[this.currentDate][student.id] = 'present';
        this.saveData();
        
        this.showNotification(`تم تسجيل حضور ${student.name} بنجاح`, 'success');
        document.getElementById('student-code').value = '';
        previewEl.classList.remove('show');
        document.getElementById('student-code').focus();
        
        this.updateDisplay();
    }

    markAllAbsent() {
        if (!this.attendance[this.currentDate]) {
            this.attendance[this.currentDate] = {};
        }

        let absentCount = 0;
        this.students.forEach(student => {
            if (!this.attendance[this.currentDate][student.id]) {
                this.attendance[this.currentDate][student.id] = 'absent';
                absentCount++;
            }
        });

        this.saveData();
        this.showNotification(`تم تسجيل غياب ${absentCount} طالب`, 'success');
        this.updateDisplay();
    }

    exportDailyReport() {
        const todayAttendance = this.attendance[this.currentDate] || {};
        const presentStudents = [];
        const absentStudents = [];

        this.students.forEach(student => {
            const status = todayAttendance[student.id];
            if (status === 'present') {
                presentStudents.push(student);
            } else if (status === 'absent') {
                absentStudents.push(student);
            }
        });

        const reportDate = new Date().toLocaleDateString('ar-SA');
        let csvContent = `تقرير الحضور ليوم ${reportDate}\n\n`;
        
        csvContent += "الطلاب الحاضرون:\n";
        csvContent += "الاسم,الكود,الصف\n";
        presentStudents.forEach(student => {
            csvContent += `${student.name},${student.code},${student.class || ''}\n`;
        });
        
        csvContent += "\nالطلاب الغائبون:\n";
        csvContent += "الاسم,الكود,الصف\n";
        absentStudents.forEach(student => {
            csvContent += `${student.name},${student.code},${student.class || ''}\n`;
        });

        csvContent += `\nإجمالي الحاضرين: ${presentStudents.length}\n`;
        csvContent += `إجمالي الغائبين: ${absentStudents.length}\n`;
        csvContent += `إجمالي الطلاب: ${this.students.length}\n`;
        csvContent += `نسبة الحضور: ${((presentStudents.length / this.students.length) * 100).toFixed(1)}%\n`;

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `تقرير_الحضور_${this.currentDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('تم تصدير التقرير بنجاح', 'success');
    }

    showAddStudentModal() {
        const modal = document.getElementById('add-student-modal');
        modal.classList.add('show');
        document.getElementById('new-student-name').focus();
        
        // Clear form
        document.getElementById('new-student-name').value = '';
        document.getElementById('new-student-code').value = '';
        document.getElementById('new-student-class').value = '';
        document.getElementById('new-student-group').value = '';
    }

    hideAddStudentModal() {
        const modal = document.getElementById('add-student-modal');
        modal.classList.remove('show');
    }

    generateStudentCode() {
        // Generate simple numeric code based on timestamp
        const code = Date.now().toString().slice(-4);
        document.getElementById('new-student-code').value = code;
    }

    addStudent() {
        const name = document.getElementById('new-student-name').value.trim();
        const code = document.getElementById('new-student-code').value.trim();
        const studentClass = document.getElementById('new-student-class').value.trim();
        const group = document.getElementById('new-student-group').value.trim();

        if (!name || !code) {
            this.showNotification('يرجى إدخال اسم الطالب والكود', 'warning');
            return;
        }

        // Check if code already exists
        if (this.students.some(s => s.code === code)) {
            this.showNotification('هذا الكود موجود مسبقاً', 'error');
            return;
        }

        const student = {
            id: Date.now().toString(),
            name,
            code,
            class: studentClass,
            group: group,
            createdAt: new Date().toISOString()
        };

        this.students.push(student);
        this.saveData();
        this.hideAddStudentModal();
        this.showNotification(`تم إضافة الطالب ${name} بنجاح`, 'success');
        this.updateDisplay();
    }

    deleteStudent(studentId) {
        if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
            this.students = this.students.filter(s => s.id !== studentId);
            
            // Remove from all attendance records
            Object.keys(this.attendance).forEach(date => {
                delete this.attendance[date][studentId];
            });
            
            this.saveData();
            this.showNotification('تم حذف الطالب بنجاح', 'success');
            this.updateDisplay();
        }
    }

    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const newName = prompt('اسم الطالب:', student.name);
        if (newName === null) return;

        const newCode = prompt('كود الطالب:', student.code);
        if (newCode === null) return;

        const newClass = prompt('الصف:', student.class || '');
        if (newClass === null) return;

        const newGroup = prompt('المجموعة:', student.group || '');
        if (newGroup === null) return;

        // Check if new code conflicts with existing codes (except current student)
        if (newCode !== student.code && this.students.some(s => s.code === newCode && s.id !== studentId)) {
            this.showNotification('هذا الكود موجود مسبقاً', 'error');
            return;
        }

        student.name = newName.trim();
        student.code = newCode.trim();
        student.class = newClass.trim();
        student.group = newGroup.trim();

        this.saveData();
        this.showNotification('تم تحديث بيانات الطالب بنجاح', 'success');
        this.updateDisplay();
    }

    searchStudents(query) {
        const filteredStudents = this.students.filter(student =>
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.code.toLowerCase().includes(query.toLowerCase()) ||
            (student.class && student.class.toLowerCase().includes(query.toLowerCase())) ||
            (student.group && student.group.toLowerCase().includes(query.toLowerCase()))
        );
        this.displayStudents(filteredStudents);
    }

    importStudents() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.txt,.pdf';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type === 'application/pdf') {
                this.importFromPDF(file);
            } else {
                this.importFromCSV(file);
            }
        };

        input.click();
    }

    async importFromPDF(file) {
        try {
            // Show loading notification
            this.showNotification('جاري قراءة ملف PDF...', 'warning');
            
            // Enhanced PDF.js loading with multiple fallbacks
            let pdfjsLib;
            const cdnUrls = [
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js',
                'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.min.js',
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.js'
            ];
            
            let loadSuccess = false;
            for (const url of cdnUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const script = document.createElement('script');
                        script.src = url;
                        script.onload = () => { loadSuccess = true; };
                        document.head.appendChild(script);
                        
                        // Wait for script to load
                        await new Promise((resolve, reject) => {
                            script.onload = resolve;
                            script.onerror = reject;
                            setTimeout(reject, 10000); // 10 second timeout
                        });
                        
                        if (window.pdfjsLib) {
                            pdfjsLib = window.pdfjsLib;
                            break;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load PDF.js from ${url}:`, error);
                    continue;
                }
            }
            
            if (!pdfjsLib) {
                throw new Error('فشل في تحميل مكتبة قراءة PDF. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى');
            }
            
            // Set worker source with fallbacks
            const workerUrls = [
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js',
                'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
            ];
            
            for (const workerUrl of workerUrls) {
                try {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                    break;
                } catch (error) {
                    console.warn(`Failed to set worker from ${workerUrl}`);
                    continue;
                }
            }

            const arrayBuffer = await file.arrayBuffer();
            
            // Enhanced PDF loading with better error handling
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                useSystemFonts: true,
                disableFontFace: false,
                isEvalSupported: false,
                disableAutoFetch: true,
                disableStream: true,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/standard_fonts/',
                verbosity: 0 // Reduce console noise
            });
            
            const pdf = await Promise.race([
                loadingTask.promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('انتهت مهلة تحميل الملف')), 30000))
            ]);
            
            let fullText = '';
            let rawTextItems = [];
            const maxPages = Math.min(pdf.numPages, 50); // Limit to 50 pages for performance
            
            // Extract text from pages with better error handling
            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    
                    // Get text content with enhanced options
                    const textContent = await page.getTextContent({
                        normalizeWhitespace: true,
                        disableCombineTextItems: false,
                        includeMarkedContent: false
                    });
                    
                    if (textContent && textContent.items) {
                        // Process text items with better Arabic support
                        textContent.items.forEach(item => {
                            if (item.str && typeof item.str === 'string') {
                                let text = item.str.trim();
                                
                                // Enhanced text cleaning for Arabic
                                text = text
                                    // Normalize Arabic characters
                                    .replace(/ي/g, 'ي')
                                    .replace(/ك/g, 'ك') 
                                    .replace(/ة/g, 'ة')
                                    // Remove control characters but keep Arabic, English, numbers
                                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
                                    // Clean up extra spaces
                                    .replace(/\s+/g, ' ')
                                    .trim();
                                
                                if (text && text.length > 0) {
                                    rawTextItems.push({
                                        text: text,
                                        x: item.transform ? item.transform[4] : 0,
                                        y: item.transform ? item.transform[5] : 0,
                                        width: item.width || 0,
                                        height: item.height || 0,
                                        page: pageNum
                                    });
                                }
                            }
                        });
                        
                        // Create page text
                        const pageText = textContent.items
                            .map(item => (item.str || '').trim())
                            .filter(text => text.length > 0)
                            .join(' ');
                        
                        if (pageText && pageText.trim().length > 0) {
                            fullText += pageText + '\n';
                        }
                    }
                    
                    // Update progress
                    if (pageNum % 5 === 0) {
                        this.showNotification(`جاري قراءة الصفحة ${pageNum} من ${maxPages}...`, 'warning');
                    }
                    
                } catch (pageError) {
                    console.warn(`خطأ في قراءة الصفحة ${pageNum}:`, pageError);
                    continue;
                }
            }
            
            // Try advanced parsing if basic extraction failed
            if (!this.hasValidStudentData(fullText) && rawTextItems.length > 0) {
                console.log('محاولة التحليل المتقدم للنص...');
                const advancedText = this.advancedPDFParsing(rawTextItems);
                if (advancedText && advancedText.length > fullText.length) {
                    fullText = advancedText;
                }
            }
            
            if (!fullText || fullText.trim().length === 0) {
                throw new Error('الملف فارغ أو لا يحتوي على نص قابل للقراءة. تأكد من أن الملف يحتوي على نص وليس صور فقط');
            }
            
            console.log('تم استخراج النص بنجاح:', fullText.substring(0, 200) + '...');
            this.processImportedData(fullText);
            
        } catch (error) {
            console.error('خطأ في استيراد ملف PDF:', error);
            
            let errorMessage = 'خطأ في قراءة ملف PDF';
            
            if (error.message.includes('Invalid PDF') || error.message.includes('invalid')) {
                errorMessage = 'الملف المحدد ليس ملف PDF صالح أو تالف';
            } else if (error.message.includes('فارغ') || error.message.includes('لا يحتوي')) {
                errorMessage = 'الملف لا يحتوي على نص قابل للقراءة. تأكد من أن الملف يحتوي على نص وليس صور فقط';
            } else if (error.message.includes('تحميل') || error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى';
            } else if (error.message.includes('انتهت مهلة')) {
                errorMessage = 'انتهت مهلة تحميل الملف. الملف كبير جداً أو الاتصال بطيء';
            } else if (error.message.includes('مكتبة')) {
                errorMessage = 'فشل في تحميل أدوات قراءة PDF. يرجى إعادة المحاولة';
            }
            
            this.showNotification(errorMessage, 'error');
            
            // Show manual entry option as fallback
            setTimeout(() => {
                if (confirm('فشل في قراءة ملف PDF. هل تريد إدخال البيانات يدوياً في جدول؟')) {
                    this.showManualEntryModal();
                }
            }, 2000);
        }
    }

    // Enhanced student data validation
    hasValidStudentData(text) {
        if (!text || text.trim().length < 10) return false;
        
        const lines = text.split('\n').filter(line => line.trim().length > 3);
        if (lines.length < 2) return false;
        
        let validStudentLines = 0;
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
        const codeRegex = /[A-Za-z0-9]{2,}/;
        
        for (const line of lines) {
            const hasArabic = arabicRegex.test(line);
            const hasCode = codeRegex.test(line);
            
            if (hasArabic && hasCode) {
                validStudentLines++;
            }
        }
        
        return validStudentLines >= 2;
    }

    // Enhanced student data extraction with better Arabic support
    extractStudentData(line) {
        let name = '';
        let code = '';
        let studentClass = '';
        
        // Clean and normalize the line first
        const cleanLine = line
            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w\d\-_.,()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (!cleanLine || cleanLine.length < 3) {
            return { name: '', code: '', class: '' };
        }
        
        // Enhanced patterns for better Arabic name and code recognition
        const patterns = [
            // Pattern 1: Arabic name then code
            /^([\u0600-\u06FF][\u0600-\u06FF\s]{1,30}?)\s+([A-Za-z0-9]{2,15})/,
            // Pattern 2: Code then Arabic name  
            /^([A-Za-z0-9]{2,15})\s+([\u0600-\u06FF][\u0600-\u06FF\s]{1,30})/,
            // Pattern 3: More flexible with optional separators
            /([\u0600-\u06FF][\u0600-\u06FF\s]{1,30}?)[\s\-_,|]+([A-Za-z0-9]{2,15})|([A-Za-z0-9]{2,15})[\s\-_,|]+([\u0600-\u06FF][\u0600-\u06FF\s]{1,30})/
        ];
        
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match) {
                if (match[1] && match[2]) {
                    // Arabic name first
                    name = match[1].trim();
                    code = match[2].trim();
                } else if (match[3] && match[4]) {
                    // Code first
                    code = match[3].trim();
                    name = match[4].trim();
                }
                
                if (name && code) break;
            }
        }
        
        // Fallback: Try delimiter-based parsing
        if (!name || !code) {
            const delimiters = ['\t', ',', '|', '  ', ' - ', ': ', ';'];
            for (const delimiter of delimiters) {
                if (cleanLine.includes(delimiter)) {
                    const parts = cleanLine.split(delimiter)
                        .map(s => s.trim())
                        .filter(s => s.length > 1);
                    
                    if (parts.length >= 2) {
                        const arabicParts = parts.filter(p => /[\u0600-\u06FF]/.test(p));
                        const codeParts = parts.filter(p => /^[A-Za-z0-9]{2,}$/.test(p));
                        
                        if (arabicParts.length > 0 && codeParts.length > 0) {
                            name = arabicParts[0].trim();
                            code = codeParts[0].trim();
                            break;
                        }
                    }
                }
            }
        }
        
        // Final validation and cleanup
        if (name) {
            name = name
                .replace(/[^\u0600-\u06FF\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            // Validate Arabic name (at least 4 characters, contains Arabic)
            if (name.length < 4 || !/[\u0600-\u06FF]{2,}/.test(name)) {
                name = '';
            }
        }
        
        if (code) {
            code = code.replace(/[^A-Za-z0-9]/g, '').trim();
            
            // Validate code (at least 2 characters)
            if (code.length < 2) {
                code = '';
            }
        }
        
        return { name, code, class: studentClass };
    }

    processImportedData(content) {
        if (!content || content.trim().length === 0) {
            this.showNotification('الملف فارغ أو لا يحتوي على بيانات قابلة للقراءة', 'warning');
            return;
        }

        if (confirm('هل تريد حذف البيانات الموجودة واستبدالها بالبيانات الجديدة؟\n\nاختر "موافق" للاستبدال أو "إلغاء" للإضافة إلى البيانات الموجودة')) {
            // Clear existing data
            this.students = [];
            this.attendance = {};
            this.saveData();
        }

        // Enhanced text cleaning and normalization
        const normalizedContent = content
            // Normalize Arabic text
            .replace(/ي/g, 'ي')
            .replace(/ك/g, 'ك')
            .replace(/ة/g, 'ة')
            // Remove unwanted characters but preserve Arabic, English, numbers and basic punctuation
            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w\d\-_.,()]/g, ' ')
            // Normalize spaces
            .replace(/\s+/g, ' ')
            .trim();

        const lines = normalizedContent.split('\n').filter(line => line.trim().length > 0);
        let imported = 0;
        let failed = 0;
        let skipped = 0;

        lines.forEach((line, index) => {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine.length < 5) {
                skipped++;
                return;
            }

            // Skip header lines or irrelevant content
            if (this.isHeaderOrIrrelevantLine(cleanLine)) {
                skipped++;
                return;
            }

            const studentData = this.extractStudentData(cleanLine);
            
            if (studentData.name && studentData.code && studentData.name.length >= 2 && studentData.code.length >= 2) {
                // Validate Arabic name
                if (!/[\u0600-\u06FF]/.test(studentData.name)) {
                    failed++;
                    return;
                }
                
                // Check if code already exists
                if (!this.students.some(s => s.code === studentData.code)) {
                    this.students.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: studentData.name.trim(),
                        code: studentData.code.trim(),
                        class: studentData.class || '',
                        group: '',
                        createdAt: new Date().toISOString()
                    });
                    imported++;
                } else {
                    console.log(`Duplicate code found: ${studentData.code}`);
                    failed++;
                }
            } else {
                console.log(`Failed to parse line: "${cleanLine}"`);
                failed++;
            }
        });

        if (imported > 0) {
            this.saveData();
            this.showNotification(`تم استيراد ${imported} طالب${failed > 0 ? ` (فشل ${failed} سطر${skipped > 0 ? ` وتم تجاهل ${skipped} سطر` : ''})` : ''}`, 'success');
            this.updateDisplay();
        } else {
            this.showNotification(`لم يتم استيراد أي طلاب. تأكد من أن الملف يحتوي على أسماء عربية وأكواد صحيحة. (فشل ${failed} سطر، تجاهل ${skipped} سطر)`, 'warning');
        }
    }

    // Check if line is header or irrelevant content
    isHeaderOrIrrelevantLine(line) {
        const lowerLine = line.toLowerCase();
        const irrelevantPatterns = [
            'اسم الطالب', 'كود الطالب', 'رقم الطالب', 'الصف', 'الفصل',
            'student name', 'student code', 'student id', 'class', 'grade',
            'تاريخ', 'date', 'صفحة', 'page',
            'المجموع', 'total', 'الإجمالي',
            'تقرير', 'report', 'نظام', 'system'
        ];
        
        return irrelevantPatterns.some(pattern => lowerLine.includes(pattern)) || 
               line.length < 5 || 
               /^[\d\s\-_.,()]+$/.test(line); // Only numbers and symbols
    }

    // Check if line is header or irrelevant content (alias method for compatibility)
    isHeaderLine(line) {
        const lowerLine = line.toLowerCase();
        const headerPatterns = [
            'اسم الطالب', 'كود الطالب', 'رقم الطالب', 'الصف', 'الفصل',
            'student name', 'student code', 'student id', 'class', 'grade',
            'تاريخ', 'date', 'صفحة', 'page',
            'رقم ولي الامر', 'رقم ولي الأمر', 'phone', 'mobile'
        ];
        
        return headerPatterns.some(pattern => lowerLine.includes(pattern)) || 
               line.length < 3 || 
               /^[\d\s\-_.,()]+$/.test(line); // Only numbers and symbols
    }

    generateReport() {
        const fromDate = document.getElementById('date-from').value;
        const toDate = document.getElementById('date-to').value;

        if (!fromDate || !toDate) {
            this.showNotification('يرجى تحديد الفترة الزمنية', 'warning');
            return;
        }

        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const schoolDays = [];

        // Generate all dates in range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            schoolDays.push(dateStr);
        }

        // Calculate statistics
        let totalPresent = 0;
        let totalPossible = schoolDays.length * this.students.length;
        const studentStats = {};

        this.students.forEach(student => {
            studentStats[student.id] = {
                ...student,
                present: 0,
                absent: 0,
                percentage: 0
            };
        });

        schoolDays.forEach(date => {
            const dayAttendance = this.attendance[date] || {};
            this.students.forEach(student => {
                if (dayAttendance[student.id] === 'present') {
                    studentStats[student.id].present++;
                    totalPresent++;
                } else {
                    studentStats[student.id].absent++;
                }
            });
        });

        // Calculate percentages
        Object.values(studentStats).forEach(student => {
            const total = student.present + student.absent;
            student.percentage = total > 0 ? (student.present / total * 100).toFixed(1) : 0;
        });

        const overallPercentage = totalPossible > 0 ? (totalPresent / totalPossible * 100).toFixed(1) : 0;

        // Update display
        document.getElementById('overall-attendance').textContent = `${overallPercentage}%`;
        document.getElementById('school-days').textContent = schoolDays.length;

        // Display detailed report
        this.displayDetailedReport(Object.values(studentStats));
        this.createAttendanceChart(schoolDays);
    }

    displayDetailedReport(studentStats) {
        const container = document.getElementById('detailed-report');
        
        let html = '<h3>تقرير الطلاب التفصيلي</h3>';
        html += '<div class="report-table">';
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">';
        html += '<thead><tr style="background: var(--surface-color); border-bottom: 2px solid var(--border-color);">';
        html += '<th style="padding: 1rem; text-align: right; border: 1px solid var(--border-color);">الاسم</th>';
        html += '<th style="padding: 1rem; text-align: center; border: 1px solid var(--border-color);">الكود</th>';
        html += '<th style="padding: 1rem; text-align: center; border: 1px solid var(--border-color);">الحضور</th>';
        html += '<th style="padding: 1rem; text-align: center; border: 1px solid var(--border-color);">الغياب</th>';
        html += '<th style="padding: 1rem; text-align: center; border: 1px solid var(--border-color);">النسبة</th>';
        html += '</tr></thead><tbody>';

        studentStats.forEach(student => {
            const percentageColor = student.percentage >= 80 ? 'var(--success-color)' : 
                                   student.percentage >= 60 ? 'var(--warning-color)' : 'var(--danger-color)';
            
            html += '<tr style="border-bottom: 1px solid var(--border-color);">';
            html += `<td style="padding: 0.75rem; border: 1px solid var(--border-color);">${student.name}</td>`;
            html += `<td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">${student.code}</td>`;
            html += `<td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color); color: var(--success-color);">${student.present}</td>`;
            html += `<td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color); color: var(--danger-color);">${student.absent}</td>`;
            html += `<td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color); color: ${percentageColor}; font-weight: 600;">${student.percentage}%</td>`;
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async createAttendanceChart(schoolDays) {
        const canvas = document.getElementById('attendance-chart');
        const ctx = canvas.getContext('2d');

        // Clear previous chart
        if (window.attendanceChart) {
            window.attendanceChart.destroy();
        }

        // Prepare data
        const presentData = [];
        const absentData = [];
        const labels = [];

        schoolDays.forEach(date => {
            const dayAttendance = this.attendance[date] || {};
            let present = 0;
            let absent = 0;

            this.students.forEach(student => {
                if (dayAttendance[student.id] === 'present') {
                    present++;
                } else {
                    absent++;
                }
            });

            presentData.push(present);
            absentData.push(absent);
            labels.push(new Date(date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));
        });

        // Import Chart.js
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        // Create chart
        window.attendanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'حاضر',
                        data: presentData,
                        borderColor: 'rgb(5, 150, 105)',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'غائب',
                        data: absentData,
                        borderColor: 'rgb(220, 38, 38)',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'مخطط الحضور والغياب'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.students.length
                    }
                }
            }
        });
    }

    updateDisplay() {
        this.updateAttendanceDisplay();
        if (document.getElementById('students-tab').classList.contains('active')) {
            this.displayStudents();
        }
    }

    updateAttendanceDisplay() {
        const todayAttendance = this.attendance[this.currentDate] || {};
        
        let presentCount = 0;
        let absentCount = 0;

        this.students.forEach(student => {
            const status = todayAttendance[student.id];
            if (status === 'present') {
                presentCount++;
            } else if (status === 'absent') {
                absentCount++;
            }
        });

        document.getElementById('present-count').textContent = presentCount;
        document.getElementById('absent-count').textContent = absentCount;
        document.getElementById('total-students').textContent = this.students.length;

        // Display attendance records
        this.displayAttendanceRecords(todayAttendance);
    }

    displayAttendanceRecords(todayAttendance) {
        const container = document.getElementById('attendance-records');
        
        if (this.students.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">لا توجد طلاب مسجلين</p>';
            return;
        }

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();
            
            // Sort students by attendance status and name
            const sortedStudents = [...this.students].sort((a, b) => {
                const statusA = todayAttendance[a.id] || 'pending';
                const statusB = todayAttendance[b.id] || 'pending';
                
                if (statusA !== statusB) {
                    if (statusA === 'present') return -1;
                    if (statusB === 'present') return 1;
                    if (statusA === 'absent') return -1;
                    if (statusB === 'absent') return 1;
                }
                
                return a.name.localeCompare(b.name, 'ar');
            });

            sortedStudents.forEach(student => {
                const status = todayAttendance[student.id] || 'pending';
                const statusClass = status === 'present' ? 'status-present' : 
                                   status === 'absent' ? 'status-absent' : 'status-pending';
                const statusIcon = status === 'present' ? 'fa-check' : 
                                  status === 'absent' ? 'fa-times' : 'fa-clock';
                const statusText = status === 'present' ? 'حاضر' : 
                                  status === 'absent' ? 'غائب' : 'لم يسجل';

                const record = document.createElement('div');
                record.className = 'attendance-record';
                record.innerHTML = `
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p>الكود: ${student.code}</p>
                        ${student.class ? `<p>الصف: ${student.class}</p>` : ''}
                        ${student.group ? `<p>المجموعة: ${student.group}</p>` : ''}
                    </div>
                    <div class="attendance-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${statusText}
                    </div>
                `;
                fragment.appendChild(record);
            });

            container.innerHTML = '';
            container.appendChild(fragment);
        });
    }

    displayStudents(studentsToShow = null) {
        const container = document.getElementById('students-list');
        const students = studentsToShow || this.students;
        
        if (students.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">لا توجد طلاب</p>';
            return;
        }

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        students.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.innerHTML = `
                <div class="student-details">
                    <h4>${student.name}</h4>
                    <p>الكود: ${student.code}</p>
                    ${student.class ? `<p>الصف: ${student.class}</p>` : ''}
                    ${student.group ? `<p>المجموعة: ${student.group}</p>` : ''}
                    <p>تاريخ الإضافة: ${new Date(student.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
                <div class="student-actions">
                    <button class="btn btn-secondary btn-small" onclick="app.editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            fragment.appendChild(studentCard);
        });

        // Clear and append all at once for better performance
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    updateReportDisplay() {
        // Set current month as default if not already set
        const fromInput = document.getElementById('date-from');
        const toInput = document.getElementById('date-to');
        
        if (!fromInput.value || !toInput.value) {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            fromInput.value = firstDay.toISOString().split('T')[0];
            toInput.value = today.toISOString().split('T')[0];
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = notification.querySelector('.notification-message');
        const iconElement = notification.querySelector('.notification-icon');

        notification.className = `notification ${type}`;
        messageElement.textContent = message;
        
        // Set appropriate icon
        if (type === 'success') {
            iconElement.className = 'notification-icon fas fa-check-circle';
        } else if (type === 'error') {
            iconElement.className = 'notification-icon fas fa-exclamation-circle';
        } else if (type === 'warning') {
            iconElement.className = 'notification-icon fas fa-exclamation-triangle';
        }

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }

    addSampleData() {
        const sampleStudents = [
            { id: '1', name: 'أحمد محمد علي', code: '1', class: 'الصف الأول', group: 'مجموعة السبت', createdAt: new Date().toISOString() },
            { id: '2', name: 'فاطمة أحمد السيد', code: '2', class: 'الصف الأول', group: 'مجموعة السبت', createdAt: new Date().toISOString() },
            { id: '3', name: 'محمود صالح خالد', code: '3', class: 'الصف الثاني', group: 'مجموعة الأحد', createdAt: new Date().toISOString() },
            { id: '4', name: 'عائشة عبدالله محمد', code: '4', class: 'الصف الثاني', group: 'مجموعة الأحد', createdAt: new Date().toISOString() },
            { id: '5', name: 'يوسف حسن أحمد', code: '5', class: 'الصف الثالث', group: 'مجموعة السبت', createdAt: new Date().toISOString() }
        ];

        this.students = sampleStudents;
        this.saveData();
    }

    showManualEntryModal() {
        const modal = document.getElementById('manual-entry-modal');
        modal.classList.add('show');
        
        // Initialize table with some empty rows
        this.clearEntryTable();
        for (let i = 0; i < 5; i++) {
            this.addTableRow();
        }
    }

    hideManualEntryModal() {
        const modal = document.getElementById('manual-entry-modal');
        modal.classList.remove('show');
    }

    addTableRow(name = '', code = '', studentClass = '', group = '') {
        const tbody = document.getElementById('entry-table-body');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" class="student-name" value="${name}" placeholder="اسم الطالب">
            </td>
            <td>
                <input type="text" class="student-code" value="${code}" placeholder="كود الطالب">
            </td>
            <td>
                <input type="text" class="student-class" value="${studentClass}" placeholder="الصف (اختياري)">
            </td>
            <td>
                <input type="text" class="student-group" value="${group}" placeholder="المجموعة (اختياري)">
            </td>
            <td>
                <button class="delete-row-btn" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        // Focus on the name input for the new row
        const nameInput = row.querySelector('.student-name');
        if (!name) {
            nameInput.focus();
        }
    }

    clearEntryTable() {
        if (confirm('هل أنت متأكد من مسح جميع البيانات في الجدول؟')) {
            document.getElementById('entry-table-body').innerHTML = '';
        }
    }

    autoGenerateCodes() {
        const rows = document.querySelectorAll('#entry-table-body tr');
        let codeCounter = 1;
        
        rows.forEach(row => {
            const codeInput = row.querySelector('.student-code');
            const nameInput = row.querySelector('.student-name');
            
            // Only generate code if name exists and code is empty
            if (nameInput.value.trim() && !codeInput.value.trim()) {
                codeInput.value = String(codeCounter);
                codeCounter++;
            }
        });
        
        this.showNotification('تم إنشاء الأكواد التلقائية للطلاب الذين لا يملكون أكواد', 'success');
    }

    saveManualEntries() {
        const rows = document.querySelectorAll('#entry-table-body tr');
        const newStudents = [];
        const errors = [];
        let duplicateCodes = 0;
        
        // Check if user wants to clear existing data
        const hasExistingData = this.students.length > 0;
        let clearExisting = false;
        
        if (hasExistingData) {
            clearExisting = confirm('هل تريد حذف البيانات الموجودة واستبدالها بالبيانات الجديدة؟\n\nاختر "موافق" للاستبدال أو "إلغاء" للإضافة إلى البيانات الموجودة');
        }
        
        if (clearExisting) {
            this.students = [];
        }
        
        // Collect existing codes to check for duplicates
        const existingCodes = new Set(this.students.map(s => s.code));
        
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.student-name');
            const codeInput = row.querySelector('.student-code');
            const classInput = row.querySelector('.student-class');
            const groupInput = row.querySelector('.student-group');
            
            const name = nameInput.value.trim();
            const code = codeInput.value.trim();
            const studentClass = classInput.value.trim();
            const group = groupInput.value.trim();
            
            // Skip empty rows
            if (!name && !code) return;
            
            // Validate required fields
            if (!name) {
                errors.push(`الصف ${index + 1}: اسم الطالب مطلوب`);
                nameInput.style.borderColor = 'var(--danger-color)';
                return;
            }
            
            if (!code) {
                errors.push(`الصف ${index + 1}: كود الطالب مطلوب`);
                codeInput.style.borderColor = 'var(--danger-color)';
                return;
            }
            
            // Check for duplicate codes
            if (existingCodes.has(code)) {
                duplicateCodes++;
                errors.push(`الصف ${index + 1}: الكود "${code}" موجود مسبقاً`);
                codeInput.style.borderColor = 'var(--danger-color)';
                return;
            }
            
            // Reset border colors for valid entries
            nameInput.style.borderColor = 'var(--border-color)';
            codeInput.style.borderColor = 'var(--border-color)';
            
            // Add to collection and mark code as used
            existingCodes.add(code);
            newStudents.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name,
                code: code,
                class: studentClass,
                group: group,
                createdAt: new Date().toISOString()
            });
        });
        
        // Show errors if any
        if (errors.length > 0) {
            const errorMessage = errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : '');
            this.showNotification(`تم العثور على ${errors.length} خطأ:\n${errorMessage}`, 'error');
            return;
        }
        
        if (newStudents.length === 0) {
            this.showNotification('لا توجد بيانات صالحة لحفظها', 'warning');
            return;
        }
        
        // Add new students
        this.students.push(...newStudents);
        this.saveData();
        this.hideManualEntryModal();
        
        let message = `تم حفظ ${newStudents.length} طالب`;
        if (duplicateCodes > 0) {
            message += ` (تم تجاهل ${duplicateCodes} كود مكرر)`;
        }
        
        this.showNotification(message, 'success');
        this.updateDisplay();
    }

    parseBulkInput() {
        const bulkInput = document.getElementById('bulk-student-input');
        const inputText = bulkInput.value.trim();
        
        if (!inputText) {
            this.showNotification('يرجى إدخال قائمة الطلاب أولاً', 'warning');
            return;
        }

        // Clear existing table if user confirms
        if (document.getElementById('entry-table-body').children.length > 0) {
            if (!confirm('هل تريد مسح البيانات الموجودة في الجدول وإضافة البيانات الجديدة؟')) {
                return;
            }
            document.getElementById('entry-table-body').innerHTML = '';
        }

        // Enhanced text preprocessing
        const preprocessedText = inputText
            // Normalize Arabic text
            .replace(/ي/g, 'ي')
            .replace(/ك/g, 'ك') 
            .replace(/ة/g, 'ة')
            // Handle different line separators
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Clean up extra spaces but preserve structure
            .replace(/[ ]{2,}/g, '\t') // Convert multiple spaces to tabs
            .trim();

        const lines = preprocessedText.split('\n').filter(line => line.trim().length > 0);
        let parsedCount = 0;
        let failedCount = 0;
        const failedLines = [];

        console.log('Processing', lines.length, 'lines...');

        lines.forEach((line, index) => {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine.length < 3) {
                return;
            }

            // Skip obvious header lines
            if (this.isHeaderLine(cleanLine)) {
                return;
            }

            console.log(`Processing line ${index + 1}: "${cleanLine}"`);
            
            const studentData = this.parseBulkLine(cleanLine);
            
            console.log('Parsed data:', studentData);
            
            if (studentData.name && studentData.number && 
                studentData.name.length >= 6 && studentData.number > 0) {
                
                // Use simple numeric code
                const code = String(studentData.number);
                
                this.addTableRow(studentData.name, code, studentData.class || '', '');
                parsedCount++;
                console.log(`✅ Successfully parsed: ${studentData.name} (${code})`);
            } else {
                console.log(`❌ Failed to parse: "${cleanLine}"`);
                failedCount++;
                failedLines.push(cleanLine.substring(0, 50) + '...');
            }
        });

        if (parsedCount > 0) {
            this.showNotification(`تم تحليل وإضافة ${parsedCount} طالب للجدول${failedCount > 0 ? ` (فشل في ${failedCount} سطر)` : ''}`, 'success');
            // Don't clear input if some lines failed, for debugging
            if (failedCount === 0) {
                bulkInput.value = '';
            }
        } else {
            console.log('Failed lines sample:', failedLines.slice(0, 3));
            this.showNotification(`فشل في تحليل البيانات. تأكد من صحة التنسيق (فشل في ${failedCount} سطر)\n\nمثال صحيح:\n٢ محمد أحمد علي\n٣ فاطمة محمد حسن`, 'error');
        }
    }

    parseBulkLine(line) {
        let number = '';
        let name = '';
        let studentClass = '';

        // Remove extra spaces and normalize
        const cleanLine = line
            .replace(/\s+/g, ' ')
            .trim();

        // Enhanced patterns to handle Arabic name first, then number
        const patterns = [
            // Pattern 1: Arabic name followed by number (most common case)
            /^([\u0600-\u06FF][\u0600-\u06FF\s]+?)\s+([٠-٩\d]+)$/,
            // Pattern 2: More flexible - Arabic text followed by any number
            /^([^0-9٠-٩]+)\s+([٠-٩\d]+)$/,
            // Pattern 3: Handle cases with extra spaces or tabs
            /^(.+?)\s{2,}([٠-٩\d]+)$/,
            // Pattern 4: Very flexible pattern for Arabic text and numbers
            /([\u0600-\u06FF][\u0600-\u06FF\s]{5,})\s+([٠-٩\d]+)/
        ];

        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && match[1] && match[2]) {
                let nameStr = match[1].trim();
                let numberStr = match[2].trim();

                // Convert Arabic numbers to English
                numberStr = this.convertArabicToEnglishNumbers(numberStr);
                
                // Validate number
                if (/^\d+$/.test(numberStr)) {
                    const parsedNumber = parseInt(numberStr);
                    
                    // Accept reasonable student numbers (1-1000)
                    if (parsedNumber > 0 && parsedNumber <= 1000) {
                        number = parsedNumber;
                        
                        // Enhanced name cleaning - keep only Arabic characters and spaces
                        nameStr = nameStr
                            // Remove any remaining numbers or non-Arabic characters
                            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, ' ')
                            .replace(/\s+/g, ' ') // Normalize spaces
                            .trim();
                        
                        // Validate name (should be at least 6 characters and contain Arabic letters)
                        if (nameStr.length >= 6 && /[\u0600-\u06FF]{3,}/.test(nameStr)) {
                            // Additional validation: should have at least 2 words (first and last name)
                            const words = nameStr.split(' ').filter(word => word.length > 1);
                            if (words.length >= 2) {
                                name = nameStr;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return { number, name, class: studentClass };
    }

    extractFromComplexText(text) {
        let bestName = '';
        let bestNumber = '';
        let bestScore = 0;

        // Split by common separators and analyze each part
        const separators = ['\t', '  ', '\n', '،', '؍'];
        let parts = [text];
        
        separators.forEach(sep => {
            parts = parts.flatMap(part => part.split(sep));
        });
        
        parts = parts.map(p => p.trim()).filter(p => p.length > 0);

        // Find numbers and names
        const numbers = [];
        const names = [];
        
        parts.forEach(part => {
            // Check if it's a number
            const numberMatch = part.match(/^([٠-٩\d]+)$/);
            if (numberMatch) {
                const num = parseInt(this.convertArabicToEnglishNumbers(numberMatch[1]));
                if (num > 0 && num <= 100) { // Reasonable student number range
                    numbers.push(num);
                }
            }
            
            // Check if it's a name
            const cleanPart = part
                .replace(/[^\u0600-\u06FF\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (cleanPart.length >= 6 && /[\u0600-\u06FF]{3,}/.test(cleanPart)) {
                const words = cleanPart.split(' ').filter(w => w.length > 1);
                if (words.length >= 2) {
                    const score = words.length + (cleanPart.length / 10);
                    if (score > bestScore) {
                        names.push({ name: cleanPart, score });
                    }
                }
            }
        });

        // Match best number with best name
        if (numbers.length > 0 && names.length > 0) {
            bestNumber = Math.min(...numbers); // Take smallest number (likely student number)
            bestName = names.sort((a, b) => b.score - a.score)[0].name; // Take highest scoring name
        }

        return { number: bestNumber, name: bestName };
    }

    convertArabicToEnglishNumbers(str) {
        const arabicNumbers = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
        
        return str.replace(/[٠-٩]/g, (match) => arabicNumbers[match] || match);
    }

    clearBulkInput() {
        const bulkInput = document.getElementById('bulk-student-input');
        if (bulkInput.value.trim() && confirm('هل أنت متأكد من مسح النص؟')) {
            bulkInput.value = '';
            bulkInput.focus();
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AttendanceApp();
});