// lib/data.ts
// Datos semilla generados por la cadena ERP -> conector -> modelo (predictions_payload.json).
// En producción esto lo sirve la API real; aquí es el dataset que la mock API devuelve.

import type { EmployeePrediction } from "@/types";

export const TENANT_ID = "7f3a-tijuana-norte";
export const WEEK_START = "2026-06-15";
export const MODEL_VERSION = "xgb_sim_v0";

export const EMPLOYEES: EmployeePrediction[] = [
  {
    "ref": "#E7D9-6515",
    "score": 100,
    "band": "critico",
    "driver": "Retardos en aceleración",
    "line": "L3",
    "shift": "nocturno",
    "tenure": 67,
    "evidence": "Tendencia de retardos en 0.82 (subiendo). Línea con 22% rotación 90d. Ausencias concentradas tras el pago.",
    "drivers": [
      {
        "factor": "Retardos en aceleración",
        "contrib": 49,
        "detail": "tendencia de retardos en 0.82 (subiendo)"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 19,
        "detail": "línea con 22% rotación 90d"
      },
      {
        "factor": "Faltas cerca de nómina",
        "contrib": 17,
        "detail": "ausencias concentradas tras el pago"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 15,
        "detail": "dentro de la ventana 30-90 días"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.82
      ],
      [
        "Productividad",
        0.725
      ],
      [
        "Clima de línea",
        0.88
      ],
      [
        "Antigüedad",
        1.0
      ],
      [
        "Contexto",
        0.1
      ],
      [
        "Compensación",
        0.38
      ]
    ],
    "trend": [
      50,
      56,
      61,
      66,
      70,
      75,
      79,
      83,
      88,
      92,
      96,
      100
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «retardos en aceleración».\n\nAcciones priorizadas:\n1. Conversación 1:1 del supervisor en 48 h sobre transporte y turno.\n2. Asignar mentor de línea para recuperar el bono.\n3. Validar la ruta de transporte de personal.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#0A25-3150",
    "score": 100,
    "band": "critico",
    "driver": "Faltas cerca de nómina",
    "line": "L5",
    "shift": "nocturno",
    "tenure": 98,
    "evidence": "Ausencias concentradas tras el pago. Tendencia de retardos en 0.55 (subiendo). 98 días de antigüedad.",
    "drivers": [
      {
        "factor": "Faltas cerca de nómina",
        "contrib": 50,
        "detail": "ausencias concentradas tras el pago"
      },
      {
        "factor": "Retardos en aceleración",
        "contrib": 18,
        "detail": "tendencia de retardos en 0.55 (subiendo)"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 17,
        "detail": "98 días de antigüedad"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 15,
        "detail": "línea con 16% rotación 90d"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.55
      ],
      [
        "Productividad",
        0.7
      ],
      [
        "Clima de línea",
        0.64
      ],
      [
        "Antigüedad",
        0.98
      ],
      [
        "Contexto",
        0.2
      ],
      [
        "Compensación",
        0.30000000000000004
      ]
    ],
    "trend": [
      50,
      56,
      61,
      66,
      70,
      75,
      79,
      83,
      88,
      92,
      96,
      100
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «faltas cerca de nómina».\n\nAcciones priorizadas:\n1. 1:1 para entender la causa raíz de las faltas post-pago.\n2. Ofrecer flexibilidad de turno si aplica.\n3. Reforzar pertenencia al equipo.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#9445-1041",
    "score": 86,
    "band": "alto",
    "driver": "Supervisor alta rotación",
    "line": "L3",
    "shift": "nocturno",
    "tenure": 88,
    "evidence": "Línea con 22% rotación 90d. Dentro de la ventana 30-90 días. Tendencia de retardos en 0.40 (subiendo).",
    "drivers": [
      {
        "factor": "Supervisor alta rotación",
        "contrib": 52,
        "detail": "línea con 22% rotación 90d"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 20,
        "detail": "dentro de la ventana 30-90 días"
      },
      {
        "factor": "Retardos en aceleración",
        "contrib": 15,
        "detail": "tendencia de retardos en 0.40 (subiendo)"
      },
      {
        "factor": "Solicitudes de cambio de turno",
        "contrib": 13,
        "detail": "3 solicitudes en 30 días"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.4
      ],
      [
        "Productividad",
        0.625
      ],
      [
        "Clima de línea",
        0.88
      ],
      [
        "Antigüedad",
        1.0
      ],
      [
        "Contexto",
        0.25
      ],
      [
        "Compensación",
        0.28
      ]
    ],
    "trend": [
      36,
      42,
      47,
      52,
      56,
      61,
      65,
      69,
      74,
      78,
      82,
      86
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «supervisor alta rotación».\n\nAcciones priorizadas:\n1. Auditoría de estilo de supervisión en la línea.\n2. 1:1 de RH directo, sin el supervisor presente.\n3. Evaluar rotación temporal a otra línea estable.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#9DB7-2952",
    "score": 84,
    "band": "alto",
    "driver": "Supervisor alta rotación",
    "line": "L3",
    "shift": "mixto",
    "tenure": 134,
    "evidence": "Línea con 22% rotación 90d. 134 días de antigüedad. Tendencia de retardos en 0.45 (subiendo).",
    "drivers": [
      {
        "factor": "Supervisor alta rotación",
        "contrib": 49,
        "detail": "línea con 22% rotación 90d"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 19,
        "detail": "134 días de antigüedad"
      },
      {
        "factor": "Retardos en aceleración",
        "contrib": 18,
        "detail": "tendencia de retardos en 0.45 (subiendo)"
      },
      {
        "factor": "Solicitudes de cambio de turno",
        "contrib": 14,
        "detail": "3 solicitudes en 30 días"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.45
      ],
      [
        "Productividad",
        0.6499999999999999
      ],
      [
        "Clima de línea",
        0.88
      ],
      [
        "Antigüedad",
        0.89
      ],
      [
        "Contexto",
        0.15
      ],
      [
        "Compensación",
        0.21999999999999997
      ]
    ],
    "trend": [
      34,
      40,
      45,
      50,
      54,
      59,
      63,
      67,
      72,
      76,
      80,
      84
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «supervisor alta rotación».\n\nAcciones priorizadas:\n1. Auditoría de estilo de supervisión en la línea.\n2. 1:1 de RH directo, sin el supervisor presente.\n3. Evaluar rotación temporal a otra línea estable.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#11E2-2898",
    "score": 81,
    "band": "alto",
    "driver": "Caída de productividad",
    "line": "L5",
    "shift": "vespertino",
    "tenure": 210,
    "evidence": "-15% vs su histórico. Bono al 55% de meta. 210 días de antigüedad.",
    "drivers": [
      {
        "factor": "Caída de productividad",
        "contrib": 54,
        "detail": "-15% vs su histórico"
      },
      {
        "factor": "Bono no alcanzado",
        "contrib": 16,
        "detail": "bono al 55% de meta"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 15,
        "detail": "210 días de antigüedad"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 15,
        "detail": "línea con 12% rotación 90d"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.2
      ],
      [
        "Productividad",
        0.875
      ],
      [
        "Clima de línea",
        0.48
      ],
      [
        "Antigüedad",
        0.7
      ],
      [
        "Contexto",
        0.3
      ],
      [
        "Compensación",
        0.44999999999999996
      ]
    ],
    "trend": [
      31,
      37,
      42,
      47,
      51,
      56,
      60,
      64,
      69,
      73,
      77,
      81
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «caída de productividad».\n\nAcciones priorizadas:\n1. Conversación 1:1 de seguimiento.\n2. Revisar condiciones de su estación.\n3. Seguimiento semanal de la métrica.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#2108-2836",
    "score": 81,
    "band": "alto",
    "driver": "Supervisor alta rotación",
    "line": "L3",
    "shift": "mixto",
    "tenure": 120,
    "evidence": "Línea con 22% rotación 90d. 120 días de antigüedad. Tendencia de retardos en 0.35 (subiendo).",
    "drivers": [
      {
        "factor": "Supervisor alta rotación",
        "contrib": 54,
        "detail": "línea con 22% rotación 90d"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 20,
        "detail": "120 días de antigüedad"
      },
      {
        "factor": "Retardos en aceleración",
        "contrib": 14,
        "detail": "tendencia de retardos en 0.35 (subiendo)"
      },
      {
        "factor": "Defectos en aumento",
        "contrib": 12,
        "detail": "tasa de defectos en 6%"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.35
      ],
      [
        "Productividad",
        0.675
      ],
      [
        "Clima de línea",
        0.88
      ],
      [
        "Antigüedad",
        0.925
      ],
      [
        "Contexto",
        0.18
      ],
      [
        "Compensación",
        0.25
      ]
    ],
    "trend": [
      31,
      37,
      42,
      47,
      51,
      56,
      60,
      64,
      69,
      73,
      77,
      81
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «supervisor alta rotación».\n\nAcciones priorizadas:\n1. Auditoría de estilo de supervisión en la línea.\n2. 1:1 de RH directo, sin el supervisor presente.\n3. Evaluar rotación temporal a otra línea estable.\n\nVentana de acción: 7 días."
  },
  {
    "ref": "#F7B7-9017",
    "score": 78,
    "band": "medio",
    "driver": "Caída de productividad",
    "line": "L5",
    "shift": "vespertino",
    "tenure": 176,
    "evidence": "-18% vs su histórico. Línea con 16% rotación 90d. Tasa de defectos en 9%.",
    "drivers": [
      {
        "factor": "Caída de productividad",
        "contrib": 44,
        "detail": "-18% vs su histórico"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 20,
        "detail": "línea con 16% rotación 90d"
      },
      {
        "factor": "Defectos en aumento",
        "contrib": 18,
        "detail": "tasa de defectos en 9%"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 18,
        "detail": "176 días de antigüedad"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.18
      ],
      [
        "Productividad",
        0.95
      ],
      [
        "Clima de línea",
        0.64
      ],
      [
        "Antigüedad",
        0.785
      ],
      [
        "Contexto",
        0.12
      ],
      [
        "Compensación",
        0.19999999999999996
      ]
    ],
    "trend": [
      30,
      36,
      40,
      45,
      49,
      54,
      58,
      62,
      66,
      70,
      74,
      78
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «caída de productividad».\n\nAcciones priorizadas:\n1. Conversación 1:1 de seguimiento.\n2. Revisar condiciones de su estación.\n3. Seguimiento semanal de la métrica.\n\nVentana de acción: 14 días."
  },
  {
    "ref": "#D918-9276",
    "score": 58,
    "band": "vigilancia",
    "driver": "Antigüedad en zona crítica",
    "line": "L2",
    "shift": "matutino",
    "tenure": 45,
    "evidence": "Dentro de la ventana 30-90 días. Bono al 68% de meta. Tendencia de retardos en 0.25 (subiendo).",
    "drivers": [
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 57,
        "detail": "dentro de la ventana 30-90 días"
      },
      {
        "factor": "Bono no alcanzado",
        "contrib": 17,
        "detail": "bono al 68% de meta"
      },
      {
        "factor": "Retardos en aceleración",
        "contrib": 15,
        "detail": "tendencia de retardos en 0.25 (subiendo)"
      },
      {
        "factor": "Defectos en aumento",
        "contrib": 11,
        "detail": "tasa de defectos en 4%"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.25
      ],
      [
        "Productividad",
        0.6000000000000001
      ],
      [
        "Clima de línea",
        0.24
      ],
      [
        "Antigüedad",
        1.0
      ],
      [
        "Contexto",
        0.2
      ],
      [
        "Compensación",
        0.31999999999999995
      ]
    ],
    "trend": [
      30,
      33,
      36,
      39,
      41,
      44,
      46,
      49,
      51,
      53,
      56,
      58
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «antigüedad en zona crítica».\n\nAcciones priorizadas:\n1. Conversación 1:1 de seguimiento.\n2. Revisar condiciones de su estación.\n3. Seguimiento semanal de la métrica.\n\nVentana de acción: 21 días."
  },
  {
    "ref": "#68C6-4504",
    "score": 55,
    "band": "vigilancia",
    "driver": "Rechazo de tiempo extra",
    "line": "L4",
    "shift": "matutino",
    "tenure": 312,
    "evidence": "90% de rechazo a tiempo extra. Línea con 11% rotación 90d. 312 días de antigüedad.",
    "drivers": [
      {
        "factor": "Rechazo de tiempo extra",
        "contrib": 49,
        "detail": "90% de rechazo a tiempo extra"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 21,
        "detail": "línea con 11% rotación 90d"
      },
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 15,
        "detail": "312 días de antigüedad"
      },
      {
        "factor": "Solicitudes de cambio de turno",
        "contrib": 15,
        "detail": "2 solicitudes en 30 días"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.1
      ],
      [
        "Productividad",
        0.475
      ],
      [
        "Clima de línea",
        0.44
      ],
      [
        "Antigüedad",
        0.44499999999999995
      ],
      [
        "Contexto",
        0.9
      ],
      [
        "Compensación",
        0.12
      ]
    ],
    "trend": [
      30,
      33,
      35,
      38,
      40,
      42,
      44,
      47,
      49,
      51,
      53,
      55
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «rechazo de tiempo extra».\n\nAcciones priorizadas:\n1. Conversación 1:1 de seguimiento.\n2. Revisar condiciones de su estación.\n3. Seguimiento semanal de la métrica.\n\nVentana de acción: 21 días."
  },
  {
    "ref": "#BB76-6323",
    "score": 46,
    "band": "estable",
    "driver": "Antigüedad en zona crítica",
    "line": "L7",
    "shift": "vespertino",
    "tenure": 245,
    "evidence": "245 días de antigüedad. Línea con 8% rotación 90d. 30% de rechazo a tiempo extra.",
    "drivers": [
      {
        "factor": "Antigüedad en zona crítica",
        "contrib": 56,
        "detail": "245 días de antigüedad"
      },
      {
        "factor": "Supervisor alta rotación",
        "contrib": 19,
        "detail": "línea con 8% rotación 90d"
      },
      {
        "factor": "Rechazo de tiempo extra",
        "contrib": 13,
        "detail": "30% de rechazo a tiempo extra"
      },
      {
        "factor": "Bono no alcanzado",
        "contrib": 12,
        "detail": "bono al 82% de meta"
      }
    ],
    "radar": [
      [
        "Puntualidad",
        0.15
      ],
      [
        "Productividad",
        0.575
      ],
      [
        "Clima de línea",
        0.32
      ],
      [
        "Antigüedad",
        0.6125
      ],
      [
        "Contexto",
        0.3
      ],
      [
        "Compensación",
        0.18000000000000005
      ]
    ],
    "trend": [
      30,
      32,
      33,
      35,
      36,
      38,
      39,
      41,
      42,
      43,
      45,
      46
    ],
    "reco": "Diagnóstico: el modelo marca a este operador principalmente por «antigüedad en zona crítica».\n\nAcciones priorizadas:\n1. Conversación 1:1 de seguimiento.\n2. Revisar condiciones de su estación.\n3. Seguimiento semanal de la métrica.\n\nVentana de acción: 21 días."
  }
];
