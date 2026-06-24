// Register.js - User Registration with Fetch API

async function registerUser(name, email, phone, password, role = 'customer') {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                password: password,
                role: role
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Registration successful:', data);
            // Store token if returned
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return { success: true, data: data };
        } else {
            console.error('Registration failed:', data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return { success: false, message: 'An error occurred. Please try again.' };
    }
}

// Example usage:
// registerUser('John Doe', 'john@example.com', '1234567890', 'password123', 'customer')
//     .then(result => {
//         if (result.success) {
//             console.log('User registered successfully!');
//         } else {
//             console.log('Error:', result.message);
//         }
//     });
