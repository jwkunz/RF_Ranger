Below is a structured overview of commonly used analytic models applicable to **HF (3–30 MHz)** and **microwave (≈1–100 GHz)** regimes.

---

# 1. Free-Space Path Loss (FSPL)

## Model

The simplest analytic propagation model assumes unobstructed propagation in a homogeneous medium.

[
P_r = P_t G_t G_r \left(\frac{\lambda}{4\pi d}\right)^2
]

In logarithmic form:

[
FSPL(dB) = 20\log_{10}(d) + 20\log_{10}(f) + 32.44
]

*(d in km, f in MHz)*

## Physical Interpretation

Derived from the **Friis transmission equation**, assuming spherical spreading of power.

## Valid Conditions

Good approximation when:

* **Clear line-of-sight (LOS)** between antennas
* **Far-field region**
* No multipath or scattering
* Antennas correctly impedance matched
* Medium approximately homogeneous

Typical uses:

| Frequency | Applications                                     |
| --------- | ------------------------------------------------ |
| HF        | satellite links above ionosphere                 |
| Microwave | satellite, radar, point-to-point microwave links |

## Limitations

Fails when:

* Ground reflections dominate
* Multipath environment
* Terrain obstruction
* Atmospheric refraction becomes significant

---

# 2. Two-Ray Ground Reflection Model

## Model

Considers **direct path + single ground-reflected path**.

Received field:

[
E_r = \frac{E_0}{d_1} e^{-jkd_1} + \Gamma \frac{E_0}{d_2} e^{-jkd_2}
]

Where:

* ( \Gamma ) = ground reflection coefficient
* ( d_1 ) = direct path
* ( d_2 ) = reflected path

At large distances, it simplifies to:

[
P_r \propto \frac{1}{d^4}
]

instead of (1/d^2).

## Valid Conditions

Best when:

* **Flat terrain**
* **Low antenna heights**
* **Single dominant ground reflection**
* Minimal clutter

Typical domains:

| Frequency | Use                     |
| --------- | ----------------------- |
| HF        | over-sea paths          |
| VHF/UHF   | cellular base-to-mobile |
| Microwave | LOS terrestrial links   |

## Limitations

Breaks down when:

* Rough terrain
* Multiple reflections
* Diffraction from obstacles

---

# 3. Knife-Edge Diffraction (Fresnel–Kirchhoff Approximation)

## Model

Approximates diffraction over a sharp obstacle.

Diffraction parameter:

[
\nu = h\sqrt{\frac{2(d_1+d_2)}{\lambda d_1 d_2}}
]

Loss approximation:

[
L_d \approx 6.9 + 20\log_{10}\left(\sqrt{(\nu-0.1)^2+1} + \nu -0.1\right)
]

## Valid Conditions

Works well when:

* A **single ridge or obstruction**
* Obstacle edge relatively sharp
* Obstacle size ≫ wavelength

Typical use cases:

| Frequency | Use                         |
| --------- | --------------------------- |
| HF        | mountain ridges             |
| Microwave | rooftop or terrain blockage |

## Limitations

Not accurate for:

* Rounded terrain
* Multiple obstacles
* Strong multipath environments

---

# 4. Ground-Wave Propagation (Sommerfeld/Norton Model)

## Model

Describes **surface waves traveling along Earth**.

Field strength approximated by:

[
E(d) = \frac{E_0}{d}F(d,\sigma,\epsilon_r,f)
]

where (F) is a **surface attenuation function** depending on:

* ground conductivity ( \sigma )
* dielectric constant ( \epsilon_r )
* frequency

Often simplified via **Norton surface-wave approximation**.

## Valid Conditions

Best when:

* Frequencies **below ~30 MHz**
* **Long-range ground propagation**
* Smooth Earth assumption
* Sea water or uniform soil

Typical uses:

| Frequency | Use                |
| --------- | ------------------ |
| MF/HF     | maritime comms     |
| LF        | navigation beacons |

## Limitations

Not suitable for:

* Rough terrain
* Urban clutter
* Frequencies above ~30–50 MHz

---

# 5. Ionospheric Skywave (Secant Law / Chapman Layer Approximation)

## Model

HF propagation via ionospheric refraction.

Basic **secant law**:

[
f_{MUF} = f_c \sec \theta
]

Where:

* (f_{MUF}) = maximum usable frequency
* (f_c) = critical frequency
* (\theta) = incidence angle

Often combined with **Chapman electron density profile**:

[
N(h) = N_{max} e^{\frac{1}{2}(1-z-e^{-z})}
]

## Valid Conditions

Works when:

* Single reflection layer
* Gradual electron density gradient
* Quiet ionospheric conditions

Typical uses:

| Frequency | Use                      |
| --------- | ------------------------ |
| HF        | long-distance comms      |
| HF radar  | over-the-horizon systems |

## Limitations

Breaks when:

* Sporadic-E layers
* Strong geomagnetic disturbances
* Multi-hop irregular paths

---

# 6. Log-Distance Path Loss Model

## Model

A statistical analytic model:

[
PL(d) = PL(d_0) + 10n\log_{10}(d/d_0)
]

Where:

* (n) = path loss exponent (environment dependent)

Typical values:

| Environment | n       |
| ----------- | ------- |
| Free space  | 2       |
| Urban       | 2.7–3.5 |
| Indoor      | 3–5     |

## Valid Conditions

Useful when:

* Large-scale average behavior needed
* Environment statistically homogeneous

Common uses:

| Frequency | Applications      |
| --------- | ----------------- |
| Microwave | cellular planning |
| mmWave    | indoor modeling   |

## Limitations

Does not model:

* specific obstacles
* diffraction
* fast fading

---

# 7. Atmospheric Refraction (Effective Earth Radius Model)

## Model

Microwave propagation often modeled using **effective Earth radius**:

[
k = \frac{R_{eff}}{R_{earth}}
]

Typical:

[
k \approx \frac{4}{3}
]

This modifies LOS distance:

[
d_{LOS} \approx 3.57(\sqrt{h_1}+\sqrt{h_2})
]

with heights in meters and distance in km.

## Valid Conditions

Good when:

* Standard atmospheric refractivity gradient
* Frequencies **>1 GHz**
* Smooth terrain

Applications:

| Frequency | Use                |
| --------- | ------------------ |
| Microwave | terrestrial links  |
| Radar     | horizon estimation |

## Limitations

Fails under:

* ducting
* super-refraction
* temperature inversions

---

# 8. Troposcatter Model (Single Scatter Approximation)

## Model

Signal scattered by atmospheric turbulence.

Empirical analytic form:

[
L = A + 30\log_{10}(d) + 10\log_{10}(f)
]

Derived from first-order scattering theory.

## Valid Conditions

Works when:

* Distances **200–600 km**
* Frequencies **300 MHz–10 GHz**
* No direct LOS

Typical uses:

| Frequency     | Use                         |
| ------------- | --------------------------- |
| UHF/Microwave | military troposcatter links |

## Limitations

* Strongly statistical
* Highly climate dependent

---

# Summary Comparison

| Model                  | Physics             | Best Frequency | Environment            |
| ---------------------- | ------------------- | -------------- | ---------------------- |
| Free Space             | Spherical spreading | All            | LOS                    |
| Two-Ray                | Ground reflection   | VHF–microwave  | Flat terrain           |
| Knife-Edge             | Diffraction         | HF–microwave   | Single obstacle        |
| Ground Wave            | Surface wave        | LF–HF          | Smooth Earth           |
| Ionospheric            | Refraction          | HF             | Long-range             |
| Log-Distance           | Statistical         | Any            | Cluttered environments |
| Effective Earth Radius | Refraction          | Microwave      | Long LOS links         |
| Troposcatter           | Atmospheric scatter | UHF–microwave  | Beyond horizon         |

---

## Practical Engineering Approach

Real link budgets often combine several of these:

Example:

```
Received Power =
    Tx power
  + antenna gains
  - free space loss
  - diffraction loss
  - atmospheric attenuation
```

Each term comes from an **analytic closed-form model**.

