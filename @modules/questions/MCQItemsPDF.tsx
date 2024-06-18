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

const MCQItemsPDF: FC<Props> = (props) => {
  const optionPrefixes = ["a", "b", "c", "d"];

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
                {idx+1}. {q.question}
              </Text>

              {q.options.map((opt, idx) => {
                return (
                  <View style={styles.options} key={idx}>
                    <Text>
                      {optionPrefixes[idx]}. {opt.value}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default MCQItemsPDF;
