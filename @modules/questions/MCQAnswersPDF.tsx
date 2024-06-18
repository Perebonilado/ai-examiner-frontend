import React, { FC } from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { QuestionsModel } from "@/models/questions.model";

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
  },
  section: {
    margin: 10,
    padding: 10,
    display: "flex",
    flexDirection: "column",
  },
  question: {
    marginBottom: 10,
    fontSize: 18,
  },
  options: {
    paddingLeft: 20,
    paddingBottom: 10,
    fontSize: 14,
  },
  questionTitle: {
    fontWeight: "bold",
    textAlign: "center",
    margin: 20,
    fontSize: 24,
    color: "#000000",
  },
});

interface Props {
  title: string;
  questions: QuestionsModel[];
}

const MCQAnswersPDF: FC<Props> = (props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.questionTitle}>{props.title}</Text>
        </View>
        {props.questions.map((q, idx) => {
          return (
            <View style={styles.section} wrap={false} key={idx}>
              <Text style={styles.question}>
                {idx + 1}. {q.correctAnswerId}
              </Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default MCQAnswersPDF;
