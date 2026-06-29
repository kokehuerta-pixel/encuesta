document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('price-survey-form');
    const feedback = document.getElementById('form-feedback');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            // Simulate server request delay
            setTimeout(() => {
                // Clear the form fields
                form.reset();
                
                // Hide the form smoothly and show success message
                form.style.display = 'none';
                feedback.classList.remove('hidden');
                
                // Trigger a premium notification toast
                showToast("¡Tip! ¡Listo! Respuestas recibidas.");

                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }

    // Función para crear y mostrar la notificación flotante (Toast)
    function showToast(message) {
        // Eliminar toast anterior si existe
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <span class="toast-icon">✓</span>
            <span class="toast-text">${message}</span>
        `;
        document.body.appendChild(toast);
        
        // Disparar animación de entrada
        setTimeout(() => toast.classList.add('show'), 50);
        
        // Quitar la notificación después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // --- AJUSTE AUTOMÁTICO DE PORCENTAJES (SUMA 100%) ---
    const pctInputs = [
        document.getElementById('pct_comida'),
        document.getElementById('pct_cafe'),
        document.getElementById('pct_copias'),
        document.getElementById('pct_otros')
    ];

    if (pctInputs.every(el => el !== null)) {
        // Ponderaciones de referencia iniciales para distribuir si los otros campos son 0
        const defaultWeights = {
            'pct_comida': 50,
            'pct_cafe': 22,
            'pct_copias': 10,
            'pct_otros': 18
        };

        pctInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const changedInput = e.target;
                let val = parseInt(changedInput.value);
                
                // Si el campo queda vacío o inválido, asumimos 0
                if (isNaN(val)) val = 0;
                
                // Restringir el valor entre 0 y 100
                if (val < 0) val = 0;
                if (val > 100) val = 100;
                changedInput.value = val;

                const remaining = 100 - val;
                const otherInputs = pctInputs.filter(inp => inp !== changedInput);
                const sumOthers = otherInputs.reduce((sum, inp) => sum + (parseInt(inp.value) || 0), 0);

                if (sumOthers > 0) {
                    // Distribuir el remanente proporcionalmente entre los demás
                    let distributedVals = otherInputs.map(inp => {
                        const currentVal = parseInt(inp.value) || 0;
                        const newVal = Math.round((currentVal / sumOthers) * remaining);
                        return { input: inp, value: newVal };
                    });

                    // Validar redondeo para asegurar suma = 100
                    const tempSum = val + distributedVals.reduce((sum, item) => sum + item.value, 0);
                    const diff = 100 - tempSum;

                    if (diff !== 0 && distributedVals.length > 0) {
                        // Añadir diferencia al valor más grande para mitigar impacto visual
                        let maxIdx = 0;
                        let maxVal = -1;
                        distributedVals.forEach((item, idx) => {
                            if (item.value > maxVal) {
                                maxVal = item.value;
                                maxIdx = idx;
                            }
                        });
                        distributedVals[maxIdx].value += diff;
                    }

                    // Asignar los nuevos valores calculados
                    distributedVals.forEach(item => {
                        item.input.value = Math.max(0, item.value);
                    });
                } else {
                    // Si todos los demás campos están vacíos o son 0, distribuir usando los pesos por defecto
                    const weightSum = otherInputs.reduce((sum, inp) => sum + defaultWeights[inp.id], 0);
                    let distributedVals = otherInputs.map(inp => {
                        const w = defaultWeights[inp.id] / weightSum;
                        const newVal = Math.round(w * remaining);
                        return { input: inp, value: newVal };
                    });

                    const tempSum = val + distributedVals.reduce((sum, item) => sum + item.value, 0);
                    const diff = 100 - tempSum;

                    if (diff !== 0 && distributedVals.length > 0) {
                        distributedVals[0].value += diff;
                    }

                    distributedVals.forEach(item => {
                        item.input.value = Math.max(0, item.value);
                    });
                }
            });
        });
    }
});
