import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class HAIrRecord extends FirestoreRecord {
  HAIrRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  void _initializeFields() {}

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('hAIr');

  static Stream<HAIrRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => HAIrRecord.fromSnapshot(s));

  static Future<HAIrRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => HAIrRecord.fromSnapshot(s));

  static HAIrRecord fromSnapshot(DocumentSnapshot snapshot) => HAIrRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static HAIrRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      HAIrRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'HAIrRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is HAIrRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createHAIrRecordData() {
  final firestoreData = mapToFirestore(
    <String, dynamic>{}.withoutNulls,
  );

  return firestoreData;
}

class HAIrRecordDocumentEquality implements Equality<HAIrRecord> {
  const HAIrRecordDocumentEquality();

  @override
  bool equals(HAIrRecord? e1, HAIrRecord? e2) {
    return;
  }

  @override
  int hash(HAIrRecord? e) => const ListEquality().hash([]);

  @override
  bool isValidKey(Object? o) => o is HAIrRecord;
}
