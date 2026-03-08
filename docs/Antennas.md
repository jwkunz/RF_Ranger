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

# Custom CSV

Upload a custom 3D gain pattern sampled over azimuth/elevation offsets relative to boresight.

The software expects gains directly in dBi and interpolates nearby samples for intermediate angles.

CSV header (required):

$$
\texttt{azimuth\_deg,elevation\_deg,gain\_dbi}
$$

Column definitions:

$$
\Delta\phi=\texttt{azimuth\_deg}\in[-180,180],\quad
\Delta\theta=\texttt{elevation\_deg}\in[-90,90],\quad
G(\Delta\phi,\Delta\theta)=\texttt{gain\_dbi}
$$

Interpolation used by the app:

$$
G_{\text{interp}}=\frac{\sum_i w_i G_i}{\sum_i w_i},\quad
w_i=\frac{1}{d_i^2+\epsilon},\quad
d_i^2=(\Delta\phi-\Delta\phi_i)^2+(\Delta\theta-\Delta\theta_i)^2
$$

Example:

```csv
azimuth_deg,elevation_deg,gain_dbi
0,0,12.0
15,0,11.4
30,0,9.8
0,10,11.1
0,20,9.2
```
