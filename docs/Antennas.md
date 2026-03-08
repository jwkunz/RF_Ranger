# Omnidirectional

Idealized isotropic response with no directional attenuation:

$$
G(\Delta\phi,\Delta\theta) = G_{\text{peak}}
$$

Relative attenuation:

$$
A(\Delta\phi,\Delta\theta)=0~\text{dB}
$$

# Vertical Dipole

Broadside donut in elevation, approximated with:

$$
P(\Delta\theta)=\cos^{n_v}(\Delta\theta)
$$

Attenuation:

$$
A(\Delta\theta)=-10\log_{10}\left(\max(P(\Delta\theta),10^{-6})\right)
$$

Effective gain:

$$
G = G_{\text{peak}} - A
$$

# Vertical Monopole

Monopole over an infinite perfectly conducting ground plane.

Upper-hemisphere elevation response:

$$
P(\Delta\theta)=\cos^{n_m}(\Delta\theta),\quad |\Delta\theta|\le 90^\circ
$$

Attenuation:

$$
A(\Delta\theta)=-10\log_{10}\left(\max(P(\Delta\theta),10^{-6})\right)
$$

Ground-plane suppression term:

$$
A_{\text{ground}}=
\begin{cases}
0~\text{dB}, & |\Delta\theta|\le 90^\circ\\
40~\text{dB}, & |\Delta\theta| > 90^\circ
\end{cases}
$$

Total attenuation:

$$
A_{\text{total}}=A + A_{\text{ground}}
$$

# Horizontal Dipole

Figure-8 style azimuth behavior with elevation shaping:

$$
P(\Delta\phi,\Delta\theta)=\cos^{n_{az}}(\Delta\phi)\cos^{n_{el}}(\Delta\theta)
$$

Attenuation:

$$
A(\Delta\phi,\Delta\theta)=-10\log_{10}\left(\max(P(\Delta\phi,\Delta\theta),10^{-6})\right)
$$

# Rectangular Horn

Peak gain is user-defined as $G_{\text{peak}}$ (dBi).

Rectangular horn aperture dimensions:

$$
A=\text{horn width},\quad B=\text{horn length}
$$

Aperture-gain relation (reference):

$$
G \approx 10\log_{10}\left(\eta\frac{4\pi AB}{\lambda^2}\right)
$$

Approximate attenuation model:

$$
A(\Delta\phi,\Delta\theta)=12\left(\frac{|\Delta\phi|}{\phi_{3dB}}\right)^2+12\left(\frac{|\Delta\theta|}{\theta_{3dB}}\right)^2
$$

with beamwidths inferred from aperture dimensions and wavelength.
