import React from 'react';
import './FormComponents.scss';

// Enhanced Input Component
export const FormInput = ({ 
    label, 
    type = 'text', 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    error = '', 
    helperText = '',
    disabled = false,
    icon = null,
    ...props 
}) => {
    return (
        <div className="form-input-group">
            {label && (
                <label className="form-label" htmlFor={name}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`form-input ${error ? 'error' : ''} ${icon ? 'with-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="error-message">{error}</span>}
            {helperText && !error && <span className="helper-text">{helperText}</span>}
        </div>
    );
};

// Enhanced Select Component
export const FormSelect = ({ 
    label, 
    name, 
    value, 
    onChange, 
    options = [], 
    required = false, 
    error = '', 
    helperText = '',
    disabled = false,
    placeholder = 'Chọn...',
    ...props 
}) => {
    return (
        <div className="form-select-group">
            {label && (
                <label className="form-label" htmlFor={name}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`form-select ${error ? 'error' : ''}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="error-message">{error}</span>}
            {helperText && !error && <span className="helper-text">{helperText}</span>}
        </div>
    );
};

// Enhanced Textarea Component
export const FormTextarea = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    error = '', 
    helperText = '',
    disabled = false,
    rows = 4,
    ...props 
}) => {
    return (
        <div className="form-textarea-group">
            {label && (
                <label className="form-label" htmlFor={name}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className={`form-textarea ${error ? 'error' : ''}`}
                {...props}
            />
            {error && <span className="error-message">{error}</span>}
            {helperText && !error && <span className="helper-text">{helperText}</span>}
        </div>
    );
};

// File Upload Component
export const FileUpload = ({ 
    label, 
    name, 
    value, 
    onChange, 
    accept = 'image/*', 
    required = false, 
    error = '', 
    helperText = '',
    preview = null,
    ...props 
}) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange(e);
        }
    };

    return (
        <div className="form-file-group">
            {label && (
                <label className="form-label" htmlFor={name}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className="file-upload-wrapper">
                <input
                    type="file"
                    id={name}
                    name={name}
                    accept={accept}
                    onChange={handleFileChange}
                    required={required}
                    className="file-input"
                    {...props}
                />
                <label htmlFor={name} className="file-upload-label">
                    <div className="upload-content">
                        {preview ? (
                            <img src={preview} alt="Preview" className="preview-image" />
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-icon">📷</span>
                                <span className="upload-text">Chọn ảnh</span>
                            </div>
                        )}
                    </div>
                </label>
            </div>
            {error && <span className="error-message">{error}</span>}
            {helperText && !error && <span className="helper-text">{helperText}</span>}
        </div>
    );
};

// Form Actions Component
export const FormActions = ({ 
    onCancel, 
    onSubmit, 
    submitText = 'Lưu', 
    cancelText = 'Hủy', 
    loading = false,
    disabled = false,
    ...props 
}) => {
    return (
        <div className="form-actions">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn btn-secondary"
                {...props}
            >
                {cancelText}
            </button>
            <button
                type="submit"
                onClick={onSubmit}
                disabled={disabled || loading}
                className="btn btn-primary"
                {...props}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Đang xử lý...
                    </>
                ) : (
                    submitText
                )}
            </button>
        </div>
    );
};

// Form Validation Hook
export const useFormValidation = (initialValues, validationSchema) => {
    const [values, setValues] = React.useState(initialValues);
    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});

    const setValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const setError = (name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const setTouchedField = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValue(name, value);
        
        if (touched[name]) {
            const error = validationSchema[name] ? validationSchema[name](value) : '';
            setError(name, error);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouchedField(name);
        
        const error = validationSchema[name] ? validationSchema[name](value) : '';
        setError(name, error);
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationSchema).forEach(key => {
            const error = validationSchema[key](values[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(Object.keys(validationSchema).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        
        return isValid;
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        setValue,
        setError,
        handleChange,
        handleBlur,
        validateForm,
        resetForm
    };
};

export default {
    FormInput,
    FormSelect,
    FormTextarea,
    FileUpload,
    FormActions,
    useFormValidation
};
