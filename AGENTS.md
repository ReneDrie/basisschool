# Browsercontroles

- Gebruik voor automatische browsercontroles altijd `?test=1` in de URL, ook bij een productiepreview of offlinecontrole. Bij bestaande queryparameters gebruik je `&test=1`.
- De ontwikkelserver dempt audio standaard. De testmodus dempt zowel voorleesfragmenten als antwoordgeluidjes, ook als een test de geluidsknop bedient.
- Houd de normale productiebuild en de geluidsinstellingen van het apparaat en de browser intact.
- Alleen voor een bewuste luistercontrole gebruik je in ontwikkeling `?audio=on`, zonder `test=1`. Gebruik voor verdere automatische controles weer de stille test-URL.
