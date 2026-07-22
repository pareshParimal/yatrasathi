import { api } from '../api.js';

export const renderLogin = (rootElement) => {
    // Basic UI for Phone & OTP entry
    rootElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 80vh; background: var(--bg-main);">
            <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem; text-align: center;">
                <h1 style="color: var(--primary); font-size: 2.5rem; margin-bottom: 0.5rem;">YatraSathi</h1>
                <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem;">Your AI Travel Companion</p>
                
                <!-- Phone Step -->
                <form id="phone-form">
                    <div style="margin-bottom: 1.5rem; text-align: left;">
                        <label for="phone-input" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Mobile Number</label>
                        <input type="tel" id="phone-input" class="form-control" placeholder="e.g. +919876543210" required style="font-size: 1.2rem; padding: 1rem;">
                    </div>
                    
                    <button type="submit" class="btn-primary" id="btn-request-otp" style="width: 100%; font-size: 1.2rem; padding: 1rem;">
                        Login securely <i data-lucide="arrow-right" style="margin-left: 8px;"></i>
                    </button>
                </form>

                <!-- OTP Step (hidden initially) -->
                <form id="otp-form" style="display: none;">
                    <div style="margin-bottom: 1.5rem; text-align: left;">
                        <label for="otp-input" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Enter 6-digit OTP</label>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Hint: Use 123456 for this hackathon demo</p>
                        <input type="number" id="otp-input" class="form-control" placeholder="123456" required style="font-size: 1.5rem; padding: 1rem; text-align: center; letter-spacing: 5px;">
                    </div>

                    <!-- Only shown for new users -->
                    <div id="name-field" style="display: none; margin-bottom: 1.5rem; text-align: left;">
                        <label for="name-input" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Full Name (New User)</label>
                        <input type="text" id="name-input" class="form-control" placeholder="What should we call you?" style="font-size: 1.2rem; padding: 1rem;">
                    </div>
                    
                    <button type="submit" class="btn-primary" id="btn-verify-otp" style="width: 100%; font-size: 1.2rem; padding: 1rem;">
                        Verify & Continue
                    </button>
                    
                    <button type="button" id="btn-back" style="background: none; border: none; color: var(--text-muted); margin-top: 1rem; cursor: pointer; font-size: 1rem; text-decoration: underline;">
                        Use a different number
                    </button>
                </form>
                
                <div id="login-error" style="color: #dc2626; margin-top: 1rem; display: none;"></div>
            </div>
        </div>
    `;

    lucide.createIcons();

    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const phoneInput = document.getElementById('phone-input');
    const otpInput = document.getElementById('otp-input');
    const nameInput = document.getElementById('name-input');
    const nameField = document.getElementById('name-field');
    const btnRequest = document.getElementById('btn-request-otp');
    const btnVerify = document.getElementById('btn-verify-otp');
    const btnBack = document.getElementById('btn-back');
    const errorDiv = document.getElementById('login-error');

    let currentPhone = '';

    const showError = (msg) => {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    };

    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        currentPhone = phoneInput.value.trim();
        if (!currentPhone) return;

        btnRequest.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i>';
        lucide.createIcons();
        btnRequest.disabled = true;

        try {
            await api.requestOtp({ phone: currentPhone });
            // Show OTP form
            phoneForm.style.display = 'none';
            otpForm.style.display = 'block';
            nameField.style.display = 'block'; // We assume it could be a new user to make MVP flow simpler
        } catch (error) {
            showError(error.message || 'Failed to request OTP');
        } finally {
            btnRequest.innerHTML = 'Login securely <i data-lucide="arrow-right" style="margin-left: 8px;"></i>';
            lucide.createIcons();
            btnRequest.disabled = false;
        }
    });

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        const otp = otpInput.value.trim();
        const fullName = nameInput.value.trim();
        if (!otp) return;

        btnVerify.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i>';
        lucide.createIcons();
        btnVerify.disabled = true;

        try {
            const response = await api.verifyOtp({ 
                phone: currentPhone, 
                otp: otp,
                fullName: fullName 
            });
            
            // Save User ID to localStorage!
            localStorage.setItem('yatra_user_id', response.user.id);
            localStorage.setItem('yatra_user_name', response.user.fullName);
            
            // Redirect to home dashboard
            window.location.hash = '#home';
            // Force reload to apply auth header
            window.location.reload();
            
        } catch (error) {
            showError(error.message || 'Invalid OTP');
        } finally {
            btnVerify.innerHTML = 'Verify & Continue';
            btnVerify.disabled = false;
        }
    });

    btnBack.addEventListener('click', () => {
        otpForm.style.display = 'none';
        phoneForm.style.display = 'block';
        errorDiv.style.display = 'none';
        otpInput.value = '';
    });
};
