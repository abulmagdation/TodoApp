import 'package:flutter/material.dart';

// Patient model to hold data
class Patient {
  String name;
  Map<String, String> vitalSigns; // e.g., {"bp": "120/80", "hr": "72"}
  List<Map<String, String>> tasks; // e.g., [{"task": "Give meds", "status": "Pending"}]

  Patient({
    required this.name,
    this.vitalSigns = const {},
    this.tasks = const [],
  });
}

void main() {
  runApp(const NurseSyncApp());
}

class NurseSyncApp extends StatelessWidget {
  const NurseSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NurseSync',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomeScreen(),
    );
  }
}

// Home Screen with Patient List
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Patient> patients = []; // List to hold patients
  final TextEditingController _nameController = TextEditingController();

  void _addPatient() {
    if (_nameController.text.isNotEmpty) {
      setState(() {
        patients.add(Patient(name: _nameController.text));
        _nameController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NurseSync - Patient List'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Enter Patient Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _addPatient,
                  child: const Text('Add'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: patients.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(patients[index].name),
                  trailing: const Icon(Icons.arrow_forward),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PatientDetailsScreen(patient: patients[index]),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Patient Details Screen
class PatientDetailsScreen extends StatefulWidget {
  final Patient patient;

  const PatientDetailsScreen({super.key, required this.patient});

  @override
  State<PatientDetailsScreen> createState() => _PatientDetailsScreenState();
}

class _PatientDetailsScreenState extends State<PatientDetailsScreen> {
  final TextEditingController _bpController = TextEditingController();
  final TextEditingController _hrController = TextEditingController();
  final TextEditingController _tempController = TextEditingController();
  final TextEditingController _o2Controller = TextEditingController();
  final TextEditingController _taskController = TextEditingController();

  void _saveVitals() {
    setState(() {
      widget.patient.vitalSigns = {
        'Blood Pressure': _bpController.text,
        'Heart Rate': _hrController.text,
        'Temperature': _tempController.text,
        'Oxygen Saturation': _o2Controller.text,
      };
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vitals Saved')),
      );
    });
  }

  void _addTask() {
    if (_taskController.text.isNotEmpty) {
      setState(() {
        widget.patient.tasks.add({
          'task': _taskController.text,
          'status': 'Pending',
        });
        _taskController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.patient.name),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Vital Signs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            TextField(
              controller: _bpController,
              decoration: const InputDecoration(labelText: 'Blood Pressure (e.g., 120/80 mmHg)'),
              keyboardType: TextInputType.text,
            ),
            TextField(
              controller: _hrController,
              decoration: const InputDecoration(labelText: 'Heart Rate (bpm)'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: _tempController,
              decoration: const InputDecoration(labelText: 'Temperature (°C)'),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
            ),
            TextField(
              controller: _o2Controller,
              decoration: const InputDecoration(labelText: 'Oxygen Saturation (%)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _saveVitals,
              child: const Text('Save Vitals'),
            ),
            const SizedBox(height: 20),
            const Text('Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            TextField(
              controller: _taskController,
              decoration: const InputDecoration(labelText: 'Add Task (e.g., Give Meds)'),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _addTask,
              child: const Text('Add Task'),
            ),
            const SizedBox(height: 10),
            ...widget.patient.tasks.map((task) => ListTile(
                  title: Text(task['task']!),
                  trailing: Text(task['status']!),
                  onTap: () {
                    setState(() {
                      task['status'] = task['status'] == 'Pending' ? 'Completed' : 'Pending';
                    });
                  },
                )),
            const SizedBox(height: 20),
            const Text('Current Vitals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('BP: ${widget.patient.vitalSigns['Blood Pressure'] ?? 'Not set'}'),
            Text('HR: ${widget.patient.vitalSigns['Heart Rate'] ?? 'Not set'}'),
            Text('Temp: ${widget.patient.vitalSigns['Temperature'] ?? 'Not set'}'),
            Text('O2: ${widget.patient.vitalSigns['Oxygen Saturation'] ?? 'Not set'}'),
          ],
        ),
      ),
    );
  }
}
